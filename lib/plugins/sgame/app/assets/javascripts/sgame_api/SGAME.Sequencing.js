SGAME.Sequencing = (function(){

	//Validations
	var supportedGroupRequirements = ["completion","success"];

	var init = function(){
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

	return {
		init				: init,
		validateSequence	: validateSequence
	};

})();