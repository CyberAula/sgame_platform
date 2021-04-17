SGAME.Sequencing = (function(){
	//SGAME settings (provided by the SGAME platform)
	var _sequencingApproach;
	//Validations
	var supportedGroupRequirements = ["completion","success"];

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
			var condition = group.conditions[i];
			if(groupIds.indexOf((condition.group)+"") !== -1){
				if(supportedGroupRequirements.indexOf(condition.requirement) !== -1){
					validConditions.push(condition);
				}
			}
		}
		group.conditions = validConditions;
		if (group.conditions.length === 0){
			return false;
		}
		return group;
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
			if(ogroup.can_be_shown === false){
				nLockedGroups = nLockedGroups + 1;
				if((ogroup.shown === false)&&(ogroup.succesfully_consumed === false)){
					groups[group_ids[j]] = _updateGroupUnlock(ogroup,groups);
					if(groups[group_ids[j]].can_be_shown === true){
						//Group unlocked: Unlock group LOs
						los = _changeCanBeShownForLOsInGroup(groups[group_ids[j]],los,true);
						nLockedGroups = nLockedGroups - 1;
					}
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
		if((group.shown && group.succesfully_consumed) === true) {
			return group;
		}

		var gShown = true;
		var gSuccess = true;

		for(var i=0; i<group.los.length; i++){
			var lo = los[group.los[i]];
			gShown = gShown && (lo.shown===true);
			gSuccess = gSuccess && (lo.succesfully_consumed===true);
		}

		group.shown = gShown;
		group.succesfully_consumed = gSuccess;

		return group;
	};

	var _updateGroupUnlock = function(group,groups){
		if(typeof group.conditions === "undefined"){
			return group;
		}

		var unlock = true;
		for(var k=0; k<group.conditions.length; k++){
			if(group.conditions[k].met === false){
				//Check if condition has been met
				switch(group.conditions[k].requirement){
					case "completion":
						group.conditions[k].met = (groups[group.conditions[k].group+""].shown === true);
						break;
					case "success":
						group.conditions[k].met = (groups[group.conditions[k].group+""].succesfully_consumed === true);
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
		var group_ids = Object.keys(groups);
		var nConditionsMet = 0;
		for(var j=0; j<group_ids.length; j++){
			var ogroup = groups[group_ids[j]];
			if((ogroup.can_be_shown === false)&&(ogroup.id != group.id)&&(typeof ogroup.conditions !== "undefined")){
				for(var k=0; k<ogroup.conditions.length; k++){
					if(ogroup.conditions[k].group == group.id){
						if(ogroup.conditions[k].met === false){
							return false;
						}
						nConditionsMet = nConditionsMet + 1;
					}
				}
			}
		}
		//Currently, no locked group depends on the status of this group to be unlocked.

		if (nConditionsMet > 0){
			//A condition related to this group unlocking another group has been met. This group can be locked.
			return true;
		} else {
			//This group does not unlock any other group.
			//Lock when completed or successed depending on the sequencing approach.
			switch(_sequencingApproach){
			case "linear_completion":
				return group.shown;
			case "linear_success":
				return group.succesfully_consumed;
			case "custom":
			default:
				return ((group.shown)&&(group.succesfully_consumed));
				break;
			}
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