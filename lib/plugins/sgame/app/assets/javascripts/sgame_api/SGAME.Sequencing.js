SGAME.Sequencing = (function(){
	//SGAME settings (provided by the SGAME platform)
	var _sequencingApproach;
	//Validations
	var supportedGroupRequirements = ["completion","success","fail","score_higher","score_lower"];

	var init = function(seq_settings){
		_sequencingApproach = seq_settings["approach"];
	};

	var initGroupSequence = function(group){
		group.can_be_shown = ((typeof group.condition === "undefined")||(Object.keys(group.condition).length === 0));
		group.shown = false; //This value will be true when all LOs have been shown
		group.score = false;
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
			var group = groups[group_ids[i]];
			if((typeof group.condition === "undefined")&&(typeof group.conditions !== "undefined")){
				group = _adaptConditionsForLegacy(group);
			}
			if(typeof group.condition !== "undefined"){
				if(_validateGroupCondition(group.condition,group_ids) === false){
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
		var multipleCondition = {type: "multiple", operator: "AND", conditions: group.conditions};
		for(var i=0; i<multipleCondition.conditions.length; i++){
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
			if(_validateGroupCondition(condition.conditions[i],groupIds) === false){
				return false;
			}
		}
		return condition;
	};

	var _validateSingleGroupCondition = function(condition,groupIds){
		if(groupIds.indexOf((condition.group)+"") === -1){
			return false;
		}
		if(supportedGroupRequirements.indexOf(condition.requirement) === -1){
			return false;
		}
		if(["score_higher","score_lower"].indexOf(condition.requirement) !== -1){
			if((typeof condition.score !== "number")||(condition.score < 0)||(condition.score > 1)){
				return false;
			}
			if((condition.requirement === "score_higher")&&(condition.score === 1)){
				return false;
			}
			if((condition.requirement === "score_lower")&&(condition.score === 0)){
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
			var group = groups[lo.groups[i]+""];
			groups[lo.groups[i]+""] = _updateGroupTracking(group,los);
		}

		//Check if some group must be unlocked/locked
		var nLockedGroups = 0;
		var group_ids = Object.keys(groups);
		for(var j=0; j<group_ids.length; j++){
			var ogroup = groups[group_ids[j]];
			if((ogroup.can_be_shown === false)&&(ogroup.shown === false)){
				nLockedGroups = nLockedGroups + 1;
				groups[group_ids[j]] = _updateGroupUnlock(ogroup,groups);
				if(groups[group_ids[j]].can_be_shown === true){
					//Group unlocked: Unlock group LOs
					los = _changeCanBeShownForLOsInGroup(groups[group_ids[j]],los,true);
					nLockedGroups = nLockedGroups - 1;
				}
			}
		}
		
		for(var k=0; k<lo.groups.length; k++){
			var ogroup = groups[lo.groups[k]+""];
			if(ogroup.can_be_shown === true){
				groups[lo.groups[k]+""] = _updateGroupLock(ogroup,groups);
				if(groups[lo.groups[k]+""].can_be_shown === false){
					//Group locked: Lock group LOs
					los = _changeCanBeShownForLOsInGroup(groups[lo.groups[k]+""],los,false);
					nLockedGroups = nLockedGroups + 1;
				}
			}
		}

		var finished = (nLockedGroups === group_ids.length);
		if(finished){
			//All groups have been locked
			los = _unlockLOsWithoutGroup(los);
		}

		return {"groups": groups, "los": los, "finished": finished};
	};

	/*
	 * Update the tracking data of a specific group
	 */
	var _updateGroupTracking = function(group,los){
		if(group.shown && (group.can_be_shown === false)) {
			return group;
		}

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
		group.score = (nShown > 0) ? (nSuccess/nShown) : 1;
		
		return group;
	};

	var _updateGroupUnlock = function(group,groups){
		if((group.can_be_shown === true)||(group.shown === true)){
			return group;
		}

		//Check if condition has been met
		group.condition = _checkCondition(group.condition,groups);
		if(group.condition.met === true){
			//Unlock
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
		var cgroup = groups[condition.group+""];
		var cgroupShown = (cgroup.shown === true);
		var cmet = false;
		switch(condition.requirement){
			case "completion":
				cmet = cgroupShown;
				break;
			case "success":
				cmet = ((cgroupShown)&&(cgroup.score === 1));
				break;
			case "fail":
				cmet = ((cgroupShown)&&(cgroup.score < 1));
				break;
			case "score_higher":
				cmet = ((cgroupShown)&&(cgroup.score > condition.score));
				break;
			case "score_lower":
				cmet = ((cgroupShown)&&(cgroup.score < condition.score));
				break;
		}
		condition.met = cmet;
		return condition;
	};

	var _updateGroupLock = function(group,groups){
		var lock = _getLockForGroup(group,groups);
		group.can_be_shown = (lock===false);
		return group;
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
				conditions.concat(_getConditionsRelatedToGroup(gcondition.conditions[i],group));
			}
			return conditions;
		}
	};

	var _getLockForGroup = function(group,groups){
		if((group.shown !== true)||(group.can_be_shown !== true)){
			return false;
		}

		var group_ids = Object.keys(groups);
		var unmetConditions = false;
		for(var j=0; j<group_ids.length; j++){
			var ogroup = groups[group_ids[j]];
			if((ogroup.id != group.id)&&(typeof ogroup.condition !== "undefined")){
				var rconditions = _getConditionsRelatedToGroup(ogroup.condition,group);
				for(var k=0; k<rconditions.length; k++){
					if(rconditions[k].met === true){
						//This group has been shown and a condition related to the group has been unlocked
						return true;
					} else {
						unmetConditions = true;
					}
				}	
			}
		}

		//This group has been shown but no condition related to the group has been unlocked
		
		if(unmetConditions === true){
			//There are groups waiting for being unlocked based on this group
			return false;
		}

		//This group has been shown and no group is waiting.
		//Lock when completed or successed depending on the sequencing approach.
		switch(_sequencingApproach){
		case "linear_success":
			return (group.score === 1);
		case "linear_completion":
		case "custom":
		default:
			return true;
		}
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

	return {
		init					: init,
		initGroupSequence	 	: initGroupSequence,
		validateSequence		: validateSequence,
		updateGroupsTracking	: updateGroupsTracking
	};

})();