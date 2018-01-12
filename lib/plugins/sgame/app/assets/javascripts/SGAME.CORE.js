SGAME.CORE = (function(){
	var _settings = {};
	var _los = {};
	var _all_mapped_los = [];
	var _event_mapping = {};
	var _togglePauseFunction = undefined;

	//Init debug module for developping
	SGAME.Debugger.init(true);

	/**
	 * SGAME API
	 * 
	 * init
	 * loadSeetings
	 * triggerLO
	 * showLO
	 **/

	var init = function(options){
		SGAME.Debugger.log("SGAME init with options ");
		SGAME.Debugger.log(options);

		if(options){
			if(typeof options.togglePause === "function"){
				_togglePauseFunction = options.togglePause;
			}
		}
	};

	var loadSettings = function(settings){
		SGAME.Debugger.log("SGAME load settings ");
		SGAME.Debugger.log(settings);

		_settings = settings;
		_los = {};
		_all_mapped_los = [];
		_event_mapping = {};

		if(settings.lo_list){
			for(var i=0; i<settings.lo_list.length;i++){
				if(typeof settings.lo_list[i].id != "undefined"){
					_los[settings.lo_list[i].id] = settings.lo_list[i];
					_all_mapped_los.push({"id": settings.lo_list[i].id, "marked": false});
				}

			}
		}

		if(settings.event_mapping){
			for(var i=0;i<settings.event_mapping.length;i++){
				var eMapping = settings.event_mapping[i];
				_event_mapping[eMapping.event_id] = {};
				_event_mapping[eMapping.event_id].los = [];
				for(var j=0; j<eMapping.los_id.length; j++){
					_event_mapping[eMapping.event_id].los.push({id: eMapping.los_id[j], marked: false});
				}
			}
		}
	};

	var triggerLO = function(event_id,callback){
		var los_candidate = [];
		if(typeof _event_mapping[event_id] != "undefined"){
			los_candidate = _event_mapping[event_id].los;
		}
		if((los_candidate)&&(los_candidate instanceof Array)&&(los_candidate.length > 0)){
			if(_containWildcard(los_candidate)){
				var rRobinResult = _roundRobinChoice(_all_mapped_los);
				_all_mapped_los = rRobinResult.los;
			} else {
				var rRobinResult = _roundRobinChoice(los_candidate);
				_event_mapping[event_id].los = rRobinResult.los;
			}
			if(typeof rRobinResult.lo != "undefined"){
				showLO(_los[rRobinResult.lo.id],callback);
			} else {
				if(typeof callback == "function"){
					callback(null,null);
				}
			}
		} else {
			if(typeof callback == "function"){
				callback(null,null);
			}
		}
	};

	/*
	 * Show a Learning Object
	 */
	var showLO = function(lo,callback){
		if((typeof lo != "object")||(typeof lo["url"] != "string")){
			if(typeof callback == "function"){
				callback(null,null);
			}
			return;
		}

		_togglePause();
		SGAME.Fancybox.create({lo: lo}, function(report){
			// SGAME.Debugger.log("LO report");
			// SGAME.Debugger.log(report);
			if(typeof callback == "function"){
				callback(report.success,report);
			}
			_togglePause();
		});
	};

	/*
	 * Show a random Learning Object
	 */
	var showRandomLO = function(callback){
		SGAME.API.requestLOMetadata(undefined, function(metadata){
			//Success
			showLO(metadata,callback);
		}, function(){
			//Fail
			if(typeof callback == "function"){
				callback(null,null);
			}
		});
	};

	/*
	 * Close the current Learning Object
	 */
	var closeLO = function(){
		SGAME.Fancybox.closeCurrentFancybox();
	};


	//////////////
	// Utils
	//////////////

	/*
	 * Toggle the pause status of the game
	 */
	var _togglePause = function(){
		if(typeof _togglePauseFunction === "function"){
			_togglePauseFunction();
		}
	};

	/*
	 * Return true if an LOs array contain the special id '*'
	 * In that case any LO of the game can be showed
	 */
	var _containWildcard = function(los_array){
		for(var i=0; i<los_array.length; i++){
			if(los_array[i].id==="*"){
				return true;
			}
		}
		return false;
	};

	var _roundRobinChoice = function(los){
		var selectedLO;
		var candidate_los = [];

		for(var i=0; i<los.length; i++){
			if(los[i].marked === false){
				candidate_los.push(los[i]);
			}
		}

		if(candidate_los.length > 0){
			selectedLO = SGAME.Utils.getRandomElement(candidate_los);
		} else {
			//All LOs marked, reset
			for(var i=0; i<los.length; i++){
				los[i].marked = false;
			}
			selectedLO = SGAME.Utils.getRandomElement(los);
		}

		if(typeof selectedLO != "undefined"){
			los[los.indexOf(selectedLO)].marked = true;
		}
		return {lo: selectedLO, los: los};
	};


	return {
		init 			: init,
		loadSettings	: loadSettings,
		triggerLO		: triggerLO,
		showLO 			: showLO,
		showRandomLO	: showRandomLO,
		closeLO			: closeLO
	};

})();