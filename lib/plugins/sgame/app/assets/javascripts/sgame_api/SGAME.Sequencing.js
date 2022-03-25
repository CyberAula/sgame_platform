SGAME.Sequencing = (function(){
	//SGAME settings (provided by the SGAME platform)
	var _sequencingApproach;
	//Validations
	var supportedGroupRequirements = ["completion","completion_higher_inmediate","success","fail","score_higher","score_higher_inmediate","score_lower"];

	var init = function(seq_settings){
		_sequencingApproach = seq_settings["approach"];
	};

	var initGroupSequence = function(group){
		group.can_be_shown = ((typeof group.condition === "undefined")||(Object.keys(group.condition).length === 0));
		group.locked = false; //true if the group has been locked
		group.unlocked = group.can_be_shown; //true if the group has been unlocked
		group.shown = false; //This value will be true when all LOs have been shown
		group.nshown = 0; //Number of LOs shown
		group.score = false;
		group.performance = 0;
		group.condition = _resetConditionMet(group.condition);
		return group;
	};

	var _resetConditionMet = function(condition){
		if(typeof condition !== "object"){
			return condition;
		}
		condition.met = false;
		if((condition.type==="multiple")&&(Array.isArray(condition.conditions))){
			for(var i=0; i<condition.conditions.length; i++){
				condition.conditions[i] = _resetConditionMet(condition.conditions[i]);
			}
		}
		return condition;
	};

	var validateSequence = function(sequence,los){
		if((typeof sequence !== "object")||(typeof los !== "object")){
			return false;
		}

		var group_ids = Object.keys(sequence);
		var lo_ids = Object.keys(los);

		for(var i=0; i<group_ids.length; i++){
			var group = _validateGroup(sequence[group_ids[i]],lo_ids);
			if(group !== false){
				sequence[group_ids[i]] = group;
			} else {
				delete sequence[group_ids[i]];
			}
		}

		//Validate references to other groups in group conditions
		sequence = _validateGroupsConditions(sequence);

		var valid_group_ids = Object.keys(sequence);
		var los_in_valid_groups = [];
		for(var j=0; j<valid_group_ids.length; j++){
			var group = sequence[valid_group_ids[j]];
			for(var k=0; k<group.los.length; k++){
				if(los_in_valid_groups.indexOf(group.los[k])===-1){
					los_in_valid_groups.push(group.los[k]);
				}
			}
		}

		if((typeof valid_group_ids.length < 2)||(los_in_valid_groups.length < 2)){
			return false;
		}

		return sequence;
	};

	var _validateGroup = function(group,lo_ids){
		//Validate id
		if(typeof group.id === "undefined"){
			return false;
		} else {
			group.id = (group.id + "");
		}

		//Validate LOs
		var validLos = [];
		for(var i=0; i<group.los.length; i++){
			var loId = group.los[i];
			if(lo_ids.indexOf(loId) !== -1){
				validLos.push(loId);
			}
		}

		group.los = validLos;
		if(group.los.length < 1){
			return false;
		}

		return group;
	};

	var _validateGroupsConditions = function(groups){
		var group_ids = Object.keys(groups);
		var nGroups = group_ids.length;
		for(var i=0; i<nGroups; i++){
			if((typeof groups[group_ids[i]].condition === "undefined")&&(typeof groups[group_ids[i]].conditions !== "undefined")){
				groups[group_ids[i]] = _adaptConditionsForLegacy(groups[group_ids[i]]);
			}
			if(typeof groups[group_ids[i]].condition !== "undefined"){
				groups[group_ids[i]].condition = _validateGroupCondition(groups[group_ids[i]].condition,group_ids);
				if(groups[group_ids[i]].condition === false){
					//Group with conditions in incorrect format
					delete groups[group_ids[i]];
				}
			}
		}

		var nNewGroups = Object.keys(groups).length;
		if(nNewGroups === nGroups){
			return groups;
		} else {
			return _validateGroupsConditions(groups);
		}
	};

	var _adaptConditionsForLegacy = function(group){
		var multipleCondition = {id:1, type: "multiple", operator: "AND", conditions: group.conditions};
		for(var i=0; i<multipleCondition.conditions.length; i++){
			multipleCondition.conditions[i].id = (i+2);
			multipleCondition.conditions[i].type = "single";
		}
		group.condition = multipleCondition;
		delete group.conditions;
		return group;
	};

	var _validateGroupCondition = function(condition,groupIds){
		if(typeof condition !== "object"){
			return false;
		}
		//Validate condition id
		if(typeof condition.id === "undefined"){
			return false;
		} else {
			condition.id = (condition.id + "");
		}

		switch(condition.type){
		case "single":
			return _validateSingleGroupCondition(condition,groupIds);
		case "multiple":
			return _validateMultipleGroupCondition(condition,groupIds);
		default:
			return false;
		}
	};

	var _validateMultipleGroupCondition = function(condition,groupIds){
		if(["AND","OR"].indexOf(condition.operator) === -1){
			return false;
		}
		if((Array.isArray(condition.conditions) === false)||(condition.conditions.length < 1)){
			return false;
		} 
		for(var i=0; i<condition.conditions.length; i++){
			condition.conditions[i] = _validateGroupCondition(condition.conditions[i],groupIds);
			if(condition.conditions[i] === false){
				return false;
			}
		}
		return condition;
	};

	var _validateSingleGroupCondition = function(condition,groupIds){
		//Validate group id
		if(typeof condition.group === "undefined"){
			return false;
		} else {
			condition.group = (condition.group + "");
		}

		if(groupIds.indexOf(condition.group) === -1){
			return false;
		}
		if(supportedGroupRequirements.indexOf(condition.requirement) === -1){
			return false;
		}
		if(["completion_higher_inmediate","score_higher","score_higher_inmediate","score_lower"].indexOf(condition.requirement) !== -1){
			if(typeof condition.threshold === "string"){
				if(isNaN(condition.threshold)===true){
					return false;
				}
				condition.threshold = parseInt(condition.threshold)/100;
			}

			if((typeof condition.threshold !== "number")||(condition.threshold < 0)||(condition.threshold > 1)){
				return false;
			}
			if((condition.requirement === "score_lower")&&(condition.threshold === 0)){
				return false;
			}
		}
		return condition;
	};

	/*
	 * Update the tracking data of the groups after consuming a specific lo
	 */
	var updateGroupsTracking = function(lo,groups,los){
		for(var i=0; i<lo.groups.length; i++){
			var group = groups[lo.groups[i]];	
			if(group.can_be_shown === true) {
				groups[lo.groups[i]] = _updateGroupTracking(group,los);
			}
		}

		//Check if some group must be unlocked
		var group_ids = Object.keys(groups);
		for(var j=0; j<group_ids.length; j++){
			var ogroup = groups[group_ids[j]];
			if((ogroup.unlocked === false)&&(ogroup.locked === false)){
				groups[group_ids[j]] = _updateGroupUnlock(ogroup,groups);
				if(groups[group_ids[j]].unlocked === true){
					//Group unlocked: Unlock group LOs
					los = _changeCanBeShownForLOsInGroup(groups[group_ids[j]],los,true);
				}
			}
		}
		
		//Check if some group must be locked
		for(var k=0; k<lo.groups.length; k++){
			var ogroup = groups[lo.groups[k]];
			if((ogroup.unlocked === true)&&(ogroup.locked === false)){
				groups[lo.groups[k]] = _updateGroupLock(ogroup,groups);
				if(groups[lo.groups[k]].locked === true){
					//Group locked: Lock group LOs
					los = _changeCanBeShownForLOsInGroup(groups[lo.groups[k]],los,false);
				}
			}
		}

		//Sequence is finished when all groups have been locked or no more LOs of them can be shown
		var finished = true;
		for(var l=0; l<group_ids.length; l++){
			var ogroup = groups[group_ids[l]];
			if((ogroup.unlocked===true)&&(ogroup.locked===false)){
				finished = false;
				break;
			}
		}

		if(finished){
			los = _unlockLOsWithoutGroup(los);
		}

		return {"groups": groups, "los": los, "finished": finished};
	};

	/*
	 * Update the tracking data of a specific group
	 */
	var _updateGroupTracking = function(group,los){
		var nLos = group.los.length;
		var nShown = 0;
		var nSuccess = 0;

		for(var i=0; i<nLos; i++){
			var lo = los[group.los[i]];
			if(lo.shown === true){
				nShown += 1;
			}
			if(lo.successfully_consumed===true){
				nSuccess += 1;
			}
		}

		group.shown = (nShown === nLos);
		group.nshown = nShown;
		group.score = (nLos > 0) ? (nSuccess/nLos) : 0;
		group.performance = (nShown > 0) ? (nSuccess/nShown) : 0;

		return group;
	};

	var _updateGroupUnlock = function(group,groups){
		if((group.locked === true)||(group.unlocked === true)){
			return group;
		}

		//Check if condition has been met
		if(typeof group.condition !== "undefined"){
			group.condition = _checkCondition(group.condition,groups);
			if(group.condition.met === true){
				//Unlock
				group.unlocked = true;
				group.can_be_shown = true;
			}
		} else {
			group.unlocked = true;
			group.can_be_shown = true;
		}

		return group;
	};

	var _checkCondition = function(condition,groups){
		if((typeof condition === "undefined")||(condition.met === true)){
			return condition;
		}

		switch(condition.type){
		case "single":
			condition = _checkSingleCondition(condition,groups);
			break;
		case "multiple":
			condition = _checkMultipleCondition(condition,groups);
			break;
		}
		return condition;
	};

	var _checkMultipleCondition = function(condition,groups){
		for(var i=0; i<condition.conditions.length; i++){
			condition.conditions[i] = _checkCondition(condition.conditions[i],groups);
			if((condition.operator === "OR")&&((condition.conditions[i].met === true))){
				condition.met = true;
				return condition;
			} else if((condition.operator === "AND")&&((condition.conditions[i].met === false))){
				condition.met = false;
				return condition;
			}
		}

		if(condition.operator === "OR"){
			condition.met = false;
		} else if(condition.operator === "AND"){
			condition.met = true;
		}

		return condition;
	};

	var _checkSingleCondition = function(condition,groups){
		var cgroup = groups[condition.group];
		var cgroupShown = (cgroup.shown === true);
		var cmet = false;
		switch(condition.requirement){
			case "completion":
				cmet = cgroupShown;
				break;
			case "completion_higher_inmediate":
				cmet = ((cgroup.nshown/cgroup.los.length) >= condition.threshold);
				break;
			case "success":
				cmet = ((cgroupShown)&&(cgroup.score === 1));
				break;
			case "fail":
				cmet = ((cgroupShown)&&(cgroup.score < 1));
				break;
			case "score_higher":
				cmet = ((cgroupShown)&&(cgroup.score >= condition.threshold));
				break;
			case "score_higher_inmediate":
				cmet = (cgroup.score >= condition.threshold);
				break;
			case "score_lower":
				cmet = ((cgroupShown)&&(cgroup.score < condition.threshold));
				break;
		}
		condition.met = cmet;
		return condition;
	};

	var _updateGroupLock = function(group,groups){
		if((group.locked === true)||(group.unlocked === false)){
			return group;
		}
		var lock = _getLockForGroup(group,groups);
		group.locked = lock;
		group.can_be_shown = (group.locked===false);
		return group;
	};

	var _getLockForGroup = function(group,groups){
		var group_ids = Object.keys(groups);
		var groupsWaiting = false;
		for(var j=0; j<group_ids.length; j++){
			var ogroup = groups[group_ids[j]];
			if((ogroup.id != group.id)&&(typeof ogroup.condition !== "undefined")){
				var rconditions = _getConditionsRelatedToGroup(ogroup.condition,group);
				for(var k=0; k<rconditions.length; k++){
					if(rconditions[k].met === true){
						//A condition related to the group has been unlocked
						return true;
					} else {
						if(ogroup.unlocked === false){
							groupsWaiting = true;
						}
					}
				}	
			}
		}

		//No condition related to the group has been unlocked
		
		if(groupsWaiting === true){
			//There are groups waiting for being unlocked based on this group
			return false;
		}

		//No group is waiting.
		//Lock when completed or successed depending on the sequencing approach.
		switch(_sequencingApproach){
		case "linear_success":
			return (group.score === 1);
		case "linear_completion":
		case "custom":
		default:
			return (group.shown === true);
		}
	};
	
	var _getConditionsRelatedToGroup = function(gcondition,group){
		switch(gcondition.type){
		case "single":
			if(gcondition.group === group.id){
				return [gcondition];
			}
			break;
		case "multiple":
			var conditions = [];
			for(var i=0; i<gcondition.conditions.length; i++){
				conditions = conditions.concat(_getConditionsRelatedToGroup(gcondition.conditions[i],group));
			}
			return conditions;
		}
		return [];
	};

	var _changeCanBeShownForLOsInGroup = function(group,los,canBeShown){
		for(var i=0; i<group.los.length; i++){
			los[group.los[i]]["can_be_shown"] = canBeShown;
		}
		return los;
	};

	var _unlockLOsWithoutGroup = function(los){
		var lo_ids = Object.keys(los);
		for(var i=0; i<lo_ids.length; i++){
			if((typeof los[lo_ids[i]].groups === "undefined")||(los[lo_ids[i]].groups.length === 0)){
				los[lo_ids[i]]["can_be_shown"] = true;
			}
		}
		return los;
	};

	var getNLOsForTracking = function(groups){
		var _groups = JSON.parse(JSON.stringify(groups)); 
		var groupIds = Object.keys(_groups);
		var nGroups = groupIds.length;
		var paths = [];

		//Store all possible steps for advancing in the sequence
		for(var i=0; i<nGroups; i++){
			var group = _groups[groupIds[i]];
			if((group.unlocked === false)&&(typeof group.condition !== "undefined")){
				//Check if the group can be unlocked by another group
				for(var j=0; j<nGroups; j++){
					var ogroup = _groups[groupIds[j]];
					if((ogroup.unlocked === true)&&(ogroup.locked === false)&&(ogroup.id !== group.id)){
						var rconditions = _getConditionsRelatedToGroup(group.condition,ogroup);
						if(rconditions.length > 0){
							//Assume that the condition can be met
							//Lock ogroup
							var rcondition = rconditions[0];
							var newPath = {conditionId: rcondition.id, conditionGroup: group.id, lockGroupId: ogroup.id};
							
							if(((group.condition.type === "multiple")&&(group.condition.operator==="OR"))||(group.condition.type === "single")){
								//Unlock group
								newPath.unlockGroupId = group.id;
							} else if((group.condition.type === "multiple")&&(group.condition.operator==="AND")){
								//Check if all conditions have been met
								if(_metCondition(rcondition.id,group.condition).met === true){
									newPath.unlockGroupId = group.id;
								}
							}

							//Store path
							paths.push(newPath);
						}
					}
				}
			}
		}

		var nPaths = paths.length;
		if(nPaths === 0){
			//No step could be performed. Sequence finished.
			return _getLOsInUnlockedGroups(_groups);
		} else {
			//Perform the steps
			var maxLength = 0;
			for(var k=0; k<nPaths; k++){
				var newPath = JSON.parse(JSON.stringify(_groups));
				newPath[paths[k].lockGroupId].locked = true;
				if(typeof paths[k].unlockGroupId !== "undefined"){
					newPath[paths[k].unlockGroupId].unlocked = true;
				} else {
					//Do not unlock the group but met the condition
					newPath[paths[k].conditionGroup].condition = _metCondition(paths[k].conditionId,newPath[paths[k].conditionGroup].condition);
				}
				
				var pathLength = getNLOsForTracking(newPath);
				if(pathLength > maxLength){
					maxLength = pathLength;
				}
			}
			return maxLength;
		}
	};

	var _getLOsInUnlockedGroups = function(groups){
		var _nLOs = 0;
		var groupIds = Object.keys(groups);
		var nGroups = groupIds.length;
		for(var i=0; i<nGroups; i++){
			var group = groups[groupIds[i]];
			if((group.unlocked === true)&&(Array.isArray(group.los))){
				_nLOs += group.los.length;
			}
		}
		return _nLOs;
	};

	var _metCondition = function(conditionId,condition){
		if(condition.id === conditionId){
			condition.met = true;
		} else if(condition.type === "multiple"){
			//TODO: AND/OR
			condition.met = true;
			for(var i=0; i<condition.conditions.length; i++){
				condition.conditions[i] = _metCondition(conditionId,condition.conditions[i]);
				if(condition.conditions[i].met !== true){
					condition.met = false;
				}
			}
		}
		return condition;
	};

	// var _printPath = function(path){
	// 	var print = "";
	// 	var groupIds = Object.keys(path);
	// 	for(var i=0; i<groupIds.length; i++){
	// 		var group = path[groupIds[i]];
	// 		if(group.unlocked === true){
	// 			if(print !== ""){
	// 				print += " > ";
	// 			}
	// 			print += group.name;
	// 		}
	// 	}
	// 	console.log(print);
	// };

	return {
		init					: init,
		initGroupSequence	 	: initGroupSequence,
		validateSequence		: validateSequence,
		getNLOsForTracking		: getNLOsForTracking,
		updateGroupsTracking	: updateGroupsTracking
	};

})();