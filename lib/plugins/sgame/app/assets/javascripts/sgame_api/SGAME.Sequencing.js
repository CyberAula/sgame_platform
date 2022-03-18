SGAME.Sequencing = (function(){
	//SGAME settings (provided by the SGAME platform)
	var _sequencingApproach;
	//Validations
	var supportedGroupRequirements = ["completion","success","fail","score_higher","score_lower"];

	var init = function(seq_settings){
		_sequencingApproach = seq_settings["approach"];
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
			var group = _validateGroupConditions(groups[group_ids[i]],group_ids);
			if(group !== false){
				groups[group_ids[i]] = group;
			} else {
				delete groups[group_ids[i]];
			}
		}

		var nNewGroups = Object.keys(groups).length;
		if(nNewGroups === nGroups){
			return groups;
		} else {
			return _validateGroupsConditions(groups);
		}
	};

	var _validateGroupConditions = function(group,groupIds){
		if(typeof group.conditions === "undefined"){
			return group;
		}
		if(typeof group.conditions !== "object"){
			return false;
		}
		if(group.conditions.length === 0){
			delete group.conditions;
			return group;
		}

		var validConditions = [];
		for(var i=0; i<group.conditions.length; i++){
			var condition = _validateGroupCondition(group.conditions[i],groupIds);
			if(typeof condition === "object"){
				validConditions.push(condition);
			}
		}
		group.conditions = validConditions;
		if (group.conditions.length === 0){
			return false;
		}
		return group;
	};

	var _validateGroupCondition = function(condition,groupIds){
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
		if((typeof group.conditions === "undefined")||(group.can_be_shown === true)||(group.shown === true)){
			return group;
		}

		var unlock = true;
		for(var k=0; k<group.conditions.length; k++){
			if(group.conditions[k].met === false){
				//Check if condition has been met
				var cgroup = groups[group.conditions[k].group+""];
				var cgroupShown = (cgroup.shown === true);
				switch(group.conditions[k].requirement){
					case "completion":
						group.conditions[k].met = cgroupShown;
						break;
					case "success":
						group.conditions[k].met = ((cgroupShown)&&(cgroup.score === 1));
						break;
					case "fail":
						group.conditions[k].met = ((cgroupShown)&&(cgroup.score < 1));
						break;
					case "score_higher":
						group.conditions[k].met = ((cgroupShown)&&(cgroup.score > group.conditions[k].score));
						break;
					case "score_lower":
						group.conditions[k].met = ((cgroupShown)&&(cgroup.score < group.conditions[k].score));
						break;
				}

				//All conditions are AND.
				unlock = ((unlock) && (group.conditions[k].met));
				if (unlock === false){
					break;
				}
			}
		}
		group.can_be_shown = unlock;
		return group;
	};

	var _updateGroupLock = function(group,groups){
		var lock = _getLockForGroup(group,groups);
		group.can_be_shown = (lock===false);
		return group;
	};

	var _getLockForGroup = function(group,groups){
		if((group.shown !== true)||(group.can_be_shown !== true)){
			return false;
		}

		var group_ids = Object.keys(groups);
		var unmetConditions = false;
		for(var j=0; j<group_ids.length; j++){
			var ogroup = groups[group_ids[j]];
			if((ogroup.id != group.id)&&(typeof ogroup.conditions !== "undefined")){
				for(var k=0; k<ogroup.conditions.length; k++){
					if(ogroup.conditions[k].group == group.id){
						if(ogroup.conditions[k].met === true){
							//This group has been shown and a condition related to the group has been unlocked
							return true;
						} else {
							unmetConditions = true;
						}
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
		validateSequence		: validateSequence,
		updateGroupsTracking	: updateGroupsTracking
	};

})();