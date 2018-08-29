SGAME.CORE = (function(){
	
	//SGAME options (provided by the game template)
	var _options = {};
	//Internal vars
	var _togglePauseFunction = undefined;


	//SGAME settings (provided by the SGAME platform)
	var _settings = {};
	var _settings_loaded = false;

	//Validations
	var supportedRepeatLo = ["repeat","repeat_unless_successfully_consumed","no_repeat"];
	var supportedCompletionNotification = ["no_more_los","all_los_consumed","all_los_succesfully_consumed","never"];
	var supportedBehaviourWhenNoMoreLOs = ["success","failure","success_unless_damage","failure_unless_blocking"];
	var supportedEventTypes = ["reward","damage","blocking","no-effect"];

	//Internal vars
	var _los_can_be_shown = false;
	var _final_screen_shown = false;
	var _final_screen_text = "Congratulations. You have achieved the objectives of this educational game. You may close this window or continue playing.";
	

	/**
	 * SGAME API
	 * 
	 * init
	 * loadSeetings
	 * triggerLO
	 * showLO
	 * closeLO
	 * losCanBeShown
	 **/

	var init = function(options){
		SGAME.Debugger.log("SGAME init with options ");
		SGAME.Debugger.log(options);

		_options = options;

		if(options){
			if(typeof options.togglePause === "function"){
				_togglePauseFunction = options.togglePause;
			}
		}
	};

	var loadSettings = function(settings){
		SGAME.Debugger.log("SGAME load settings ");
		SGAME.Debugger.log(settings);
		_settings_loaded = true;
		_loadSettings(settings);
	};

	var _loadSettings = function(settings){
		_settings = settings;

		if(typeof _settings["game_metadata"] === "undefined"){
			_settings["game_metadata"] = {};
		}

		if(typeof _settings["los"] === "undefined"){
			_settings["los"] = {};
		}

		if(typeof _settings["events"] === "undefined"){
			_settings["events"] = {};
		}

		if(typeof _settings["event_mapping"] === "undefined"){
			_settings["event_mapping"] = {};
		}

		if(typeof _settings["sequencing"] === "undefined"){
			_settings["sequencing"] = {};
		}
		if(supportedRepeatLo.indexOf(_settings["sequencing"]["repeat_lo"]) === -1){
			_settings["sequencing"]["repeat_lo"] = "repeat";
		}

		if(typeof _settings["game_settings"] === "undefined"){
			_settings["game_settings"] = {};
		}
		if(supportedCompletionNotification.indexOf(_settings["game_settings"]["completion_notification"]) === -1){
			_settings["game_settings"]["completion_notification"] = "never";
		}
		if(supportedBehaviourWhenNoMoreLOs.indexOf(_settings["game_settings"]["behaviour_when_no_more_los"]) === -1){
			_settings["game_settings"]["behaviour_when_no_more_los"] = "success_unless_damage";
		}
		if(typeof _settings["game_settings"]["completion_notification_text"] === "string"){
			_final_screen_text = _settings["game_settings"]["completion_notification_text"];
		}

		if(typeof _settings["los"] === "object"){
			var lo_ids = Object.keys(_settings["los"]);
			var nLOs = lo_ids.length;
			for(var i=0; i<nLOs;i++){
				//Check URLs
				if(typeof _settings["los"][lo_ids[i]].url !== "undefined"){
					_settings["los"][lo_ids[i]].url = SGAME.Utils.checkUrlProtocol(_settings["los"][lo_ids[i]].url);
				}
				//Add additional vars for SGAME
				_settings["los"][lo_ids[i]]["can_be_shown"] = true;
				_settings["los"][lo_ids[i]]["shown"] = false;
				_settings["los"][lo_ids[i]]["nshown"] = 0; //number of times shown
				_settings["los"][lo_ids[i]]["succesfully_consumed"] = false;

				_settings["los"][lo_ids[i]]["acts_as_asset"] = ((_settings["los"][lo_ids[i]]["scorm_type"]==="asset")||((_settings["los"][lo_ids[i]]["scorm_type"]==="sco")&&(_settings["los"][lo_ids[i]]["report_data"]===false)));

				_los_can_be_shown = true;
			}
		}
	};

	var triggerLO = function(event_id,callback){
		var los_mapped = _getMappedLOs(event_id);
		if(los_mapped.length < 1){
			//This event has no mapped learning objects
			if(typeof callback === "function"){
				var report = _getReportWhenNoLOs(event_id);
				callback(report.success,report);
			}
			return;
		}

		var los_candidate = _getCandidateLOsFromMappedLOs(los_mapped);
		if(los_candidate.length > 0){
			//Choose one of the candidate learning objects
			selectedLO = _selectLoFromCandidates(los_candidate);
			//Show the selected learning object
			showLO(selectedLO,callback);
		} else {
			//No valid candidates for this event
			if(typeof callback === "function"){
				var report = _getReportWhenNoLOs(event_id);
				callback(report.success,report);
			}
		}
	};

	var _getMappedLOs = function(event_id){
		var los_mapped = [];

		var mapped_los_ids = _settings["event_mapping"][event_id];
		if(typeof mapped_los_ids !== "undefined"){
			var n_mapped_los_ids = mapped_los_ids.length;
			if(typeof n_mapped_los_ids === "number"){
				for(var i=0; i<n_mapped_los_ids;i++){
					if(mapped_los_ids[i] === "*"){
						//Wildcard
						los_mapped = _getAllLoArray();
						break;
					}
					if(typeof _settings["los"][mapped_los_ids[i]] !== "undefined"){
						los_mapped.push(_settings["los"][mapped_los_ids[i]]);
					}
				}
			}
		}

		return los_mapped;
	};

	var _getCandidateLOsFromMappedLOs = function(los_mapped){
		var los_candidate = [];
		var nLosMapped = los_mapped.length;
		for(var i=0; i<nLosMapped;i++){
			if(los_mapped[i]["can_be_shown"] === true){
				los_candidate.push(los_mapped[i]);
			}
		}
		return los_candidate;
	};

	var _getCandidateLOs = function(event_id){
		return _getCandidateLOsFromMappedLOs(_getMappedLOs(event_id));
	};

	/*
	 * Show a Learning Object
	 */
	var showLO = function(lo,callback){
		if((typeof lo !== "object")||(typeof lo["url"] !== "string")){
			if(typeof callback === "function"){
				callback(null,null);
			}
			return;
		}

		_togglePause();

		//Mark learning object as shown and count the number of times it has been shown
		_settings["los"][lo["id"]]["shown"] = true;
		_settings["los"][lo["id"]]["nshown"] += 1

		SGAME.Fancybox.create({lo: lo}, function(report){
			// SGAME.Debugger.log("LO report");
			// SGAME.Debugger.log(report);

			//Check if the learning object has been successfully consumed
			_settings["los"][lo["id"]]["succesfully_consumed"] = (report.success);

			//Check if the learning object can be shown again
			switch(_settings["sequencing"]["repeat_lo"]){
				case "repeat":
					//Do nothing
					break;
				case "repeat_unless_successfully_consumed":
					_settings["los"][lo["id"]]["can_be_shown"] = (_settings["los"][lo["id"]]["succesfully_consumed"]!==true);
					break;
				case "no_repeat":
					_settings["los"][lo["id"]]["can_be_shown"] = false;
					break;
				default:
					//Do nothing
					break;
			}

			_checkLOsToShow();

			//Enrich report
			report["more_los"] = _los_can_be_shown;

			_checkFinalScreen(function(){
				if(typeof callback === "function"){
					callback(report.success,report);
				}
				_togglePause();
			});
		});
	};

	/*
	 * Show a random Learning Object
	 */
	var showRandomLO = function(callback){
		SGAME.API.requestLOMetadata(undefined, function(lo_metadata){
			//Success
			showLO(lo_metadata,callback);
		}, function(){
			//Fail
			if(typeof callback === "function"){
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

	/*
	 * Return 'true' if more learning objects can be shown
	 */
	var losCanBeShown = function(event_id){
		if(_los_can_be_shown === false){
			return false;
		}
		if(typeof event_id === "undefined"){
			return _los_can_be_shown;
		}
		return (_getCandidateLOs(event_id).length > 0);
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
	 * Check if there are learning objects that can be shown
	 */
	var _checkLOsToShow = function(){
		var lo_ids = Object.keys(_settings["los"]);
		var nLOs = lo_ids.length;
		for(var i=0; i<nLOs;i++){
			if(_settings["los"][lo_ids[i]]["can_be_shown"] === true){
				_los_can_be_shown = true;
				return;
			}
		}
		_los_can_be_shown = false;
	};

	/*
	 * Show the final screen to the player
	 */
	var _checkFinalScreen = function(callback){
		if(_shouldShowFinalScreen() !== true){
			if(typeof callback === "function"){
				callback(false);
			}
		} else {
			_showFinalScreen(callback);
		}
	};

	var _shouldShowFinalScreen = function(){
		if(_final_screen_shown === true){
			return false;
		}
		switch(_settings["game_settings"]["completion_notification"]){
			case "no_more_los":
				// var lo_ids = Object.keys(_settings["los"]);
				// var nLOs = lo_ids.length;
				// for(var i=0; i<nLOs;i++){
				// 	if(_settings["los"][lo_ids[i]]["can_be_shown"] === true){
				// 		return false;
				// 	}
				// }
				// return true;
				return (_los_can_be_shown === false);
			case "all_los_consumed":
				var lo_ids = Object.keys(_settings["los"]);
				var nLOs = lo_ids.length;
				for(var i=0; i<nLOs;i++){
					if(_settings["los"][lo_ids[i]]["shown"] === false){
						return false;
					}
				}
				return true;
			case "all_los_succesfully_consumed":
				var lo_ids = Object.keys(_settings["los"]);
				var nLOs = lo_ids.length;
				for(var i=0; i<nLOs;i++){
					if(_settings["los"][lo_ids[i]]["succesfully_consumed"] === false){
						return false;
					}
				}
				return true;
			case "never":
				return false;
			default:
				return false;
		}
	};

	var _showFinalScreen = function(callback){
		_final_screen_shown = true;

		SGAME.Fancybox.create({dialog: true, msg: _final_screen_text}, function(){
			if(typeof callback === "function"){
				callback(true);
			}
		});
	};

	/*
	 * Select a learning object from a set of valid candidates.
	 * The current strategy randomly chooses one learning object among the ones that have been shown the minimum number of times.
	 */
	var _selectLoFromCandidates = function(los_candidate){
		var filtered_candidates = [];
		var nShownMin;
		
		for(var i=0; i<los_candidate.length;i++){
			if(typeof nShownMin === "undefined"){
				nShownMin = los_candidate[i]["nshown"];
			}

			if(los_candidate[i]["nshown"] < nShownMin){
				nShownMin = los_candidate[i]["nshown"];
				filtered_candidates = [];
			}

			if(nShownMin === los_candidate[i]["nshown"]){
				filtered_candidates.push(los_candidate[i]);
			}
		}

		// if(filtered_candidates.length < 1){
		// 	filtered_candidates = los_candidates;
		// }

		return SGAME.Utils.getRandomElement(filtered_candidates);
	};

	/*
	 * Get all learning objects in an array
	 */
	var _getAllLoArray = function(){
		var all_los = [];
		var all_lo_ids = Object.keys(_settings["los"]);
		for(var i=0; i<all_lo_ids.length; i++){
			if(typeof _settings["los"][all_lo_ids[i]] !== "undefined"){
				all_los.push(_settings["los"][all_lo_ids[i]]);
			}
		}
		return all_los;
	};

	/*
	 * Get all learning objects in an array
	 */
	var _getReportWhenNoLOs = function(event_id){
		return {
			lo_metadata: undefined,
			time: undefined,
			scorm_success_status: undefined,
			scorm_scaled_score: undefined,
			scorm_completion_status: undefined,
			scorm_progress_measure: undefined,
			success: _getSuccessWhenNoLOs(event_id),
			more_los: _los_can_be_shown
		};
	};

	var _getSuccessWhenNoLOs = function(event_id){
		var _setting;

		if((_settings_loaded)&&(typeof _settings["game_settings"]["behaviour_when_no_more_los"] !== "undefined")){
			_setting = _settings["game_settings"]["behaviour_when_no_more_los"];
		} else {
			if(typeof _options["behaviour_when_no_more_los"] !== "undefined"){
				_setting = _options["behaviour_when_no_more_los"];
			} else {
				if(typeof _settings["game_settings"]["behaviour_when_no_more_los"] !== "undefined"){
					_setting = _settings["game_settings"]["behaviour_when_no_more_los"];
				}
			}
		}

		return _getSuccessWhenNoLOsForSetting(_setting,event_id);
	};

	var _getSuccessWhenNoLOsForSetting = function(setting,event_id){
		switch(setting){
			case "success":
				return true;
			case "failure":
				return false;
			case "success_unless_damage":
				var event = _getEventMetadata(event_id);
				if((typeof event !== "undefined")&&(event.type === "damage")){
					return false;
				}
				//Event is not of type damage
				return true;
			case "failure_unless_blocking":
				var event = _getEventMetadata(event_id);
				if((typeof event === "undefined")||(event.type !== "blocking")){
					return false;
				}
				//Event is of type blocking
				return true;
			default:
				return false;
				break;
		};
	};

	var _getEventMetadata = function(event_id){
		if(typeof _settings["events"][event_id] !== "undefined"){
			return _settings["events"][event_id];
		} else {
			if((typeof _options["events"] === "object")&&(typeof _options["events"][event_id] !== "undefined")){
				return _options["events"][event_id];
			} else {
				return {};
			}
		}
	};

	var _loadInitialSettings = function(){
		if(_settings_loaded === false){
			_loadSettings({});
		}
	};

	//Init SGAME API
	SGAME.Debugger.init(true);
	_loadInitialSettings();


	return {
		init 			: init,
		loadSettings	: loadSettings,
		triggerLO		: triggerLO,
		showLO 			: showLO,
		showRandomLO	: showRandomLO,
		closeLO			: closeLO,
		losCanBeShown   : losCanBeShown
	};

})();