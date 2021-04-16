SGAME.CORE = (function(){
	
	//SGAME options (provided by the game template)
	var _options = {};
	//Internal vars
	var _togglePauseFunction = undefined;
	var _final_screen_text = "Congratulations. You have achieved the objectives of this educational game. You may close this window or continue playing.";

	//SGAME settings (provided by the SGAME platform)
	var _settings = {};
	var _settings_loaded = false;

	//VLE data (provided by the environment through the SGAME VLE Gateway)
	var _vle_data = {};

	//Tracking (data tracked by SGAME to be reported to the VLE through the SGAME VLE Gateway)
	var _tracking = {progress_measure: 0, completion_status: "incompleted", score: 0, success_status: "unknown"};

	//Validations
	var supportedEventTypes = ["reward","damage","blocking","no-effect"];
	var supportedRepeatLo = ["repeat","repeat_unless_successfully_consumed","no_repeat"];
	var supportedInterruptions = ["no_restrictions","n_times","1_per_timeperiod"];
	var supportedSequencingApproach = ["random","linear_completion","linear_success","custom"];
	var supportedCompletionStatus = ["all_los","percentage_los","n_los","n_times","disabled","onstart"];
	var supportedSuccessStatus = ["all_los","percentage_los","n_los","n_times","disabled","onstart","oncompletion"];
	var supportedCompletionNotification = ["no_more_los","all_los_consumed","all_los_succesfully_consumed","completion_status","success_status","never"];
	var supportedBehaviourWhenNoMoreLOs = ["success","failure","success_unless_damage","failure_unless_blocking"];

	//Internal vars
	var _los_can_be_shown = false;
	var _nLOs = 0; //Total number of LOs
	var _nloshown = 0; //Number of LOs shown
	var _nshown = 0; //Total number of times a LO has been shown
	var _nlosuccess = 0; //Number of LOs succesfully consumed
	var _nsuccess = 0; //Total number of times a LO has been succesfully consumed
	var _final_screen_shown = false;
	var _lastLoTimeStamp = undefined; //Timestamp of the last time a LO was shown
	

	/**
	 * SGAME API
	 * 
	 * init
	 * loadSeetings
	 * triggerLO
	 * showLO
	 * closeLO
	 * getSettings
	 * losCanBeShown
	 * successWhenNoLOs
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

		if(supportedInterruptions.indexOf(_settings["sequencing"]["interruptions"]) === -1){
			_settings["sequencing"]["interruptions"] = "no_restrictions";
		}

		if(supportedSequencingApproach.indexOf(_settings["sequencing"]["approach"]) === -1){
			_settings["sequencing"]["approach"] = "random";
			delete _settings["sequencing"]["sequence"];
		}

		if((["n_times","1_per_timeperiod"].indexOf(_settings["sequencing"]["interruptions"])===-1)||(typeof _settings["sequencing"]["interruptions_n"] !== "number")){
			delete _settings["sequencing"]["interruptions_n"];
		}

		if((["n_times","1_per_timeperiod"].indexOf(_settings["sequencing"]["interruptions"])!==-1)&&(typeof _settings["sequencing"]["interruptions_n"] !== "number")){
			_settings["sequencing"]["interruptions"] = "no_restrictions";
		}

		if(typeof _settings["game_settings"] === "undefined"){
			_settings["game_settings"] = {};
		}

		if(supportedCompletionStatus.indexOf(_settings["game_settings"]["completion_status"]) === -1){
			_settings["game_settings"]["completion_status"] = "disabled";
		}

		if((["percentage_los","n_los","n_times"].indexOf(_settings["game_settings"]["completion_status"])===-1)||(typeof _settings["game_settings"]["completion_status_n"] !== "number")){
			delete _settings["game_settings"]["completion_status_n"];
		}

		if((["percentage_los","n_los","n_times"].indexOf(_settings["game_settings"]["completion_status"])!==-1)&&(typeof _settings["game_settings"]["completion_status_n"] !== "number")){
			_settings["game_settings"]["completion_status"] = "disabled";
			delete _settings["game_settings"]["completion_status_n"];
		}

		if(supportedSuccessStatus.indexOf(_settings["game_settings"]["success_status"]) === -1){
			_settings["game_settings"]["success_status"] = "disabled";
		}

		if((["percentage_los","n_los","n_times"].indexOf(_settings["game_settings"]["success_status"])===-1)||(typeof _settings["game_settings"]["success_status_n"] !== "number")){
			delete _settings["game_settings"]["success_status_n"];
		}

		if((["percentage_los","n_los","n_times"].indexOf(_settings["game_settings"]["success_status"])!==-1)&&(typeof _settings["game_settings"]["success_status_n"] !== "number")){
			_settings["game_settings"]["success_status"] = "disabled";
			delete _settings["game_settings"]["success_status_n"];
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
			_nLOs = lo_ids.length;
			for(var i=0; i<_nLOs;i++){
				//Check URLs
				if(typeof _settings["los"][lo_ids[i]].url !== "undefined"){
					_settings["los"][lo_ids[i]].url = SGAME.Utils.checkUrlProtocol(_settings["los"][lo_ids[i]].url);
				}
				//Add additional vars for SGAME
				_settings["los"][lo_ids[i]]["can_be_shown"] = true;
				_settings["los"][lo_ids[i]]["shown"] = false;
				_settings["los"][lo_ids[i]]["nshown"] = 0; //number of times shown
				_settings["los"][lo_ids[i]]["succesfully_consumed"] = false;
				_settings["los"][lo_ids[i]]["nsuccess"] = 0; //number of times succesfully consumed

				_settings["los"][lo_ids[i]]["acts_as_asset"] = ((_settings["los"][lo_ids[i]]["scorm_type"]==="asset")||((_settings["los"][lo_ids[i]]["scorm_type"]==="sco")&&(_settings["los"][lo_ids[i]]["report_data"]===false)));

				_los_can_be_shown = true;
			}
		}

		if(_settings["sequencing"]["approach"] !== "random"){
			var validatedSequence = SGAME.Sequencing.validateSequence(_settings["sequencing"]["sequence"],_settings["los"]);
			if(validatedSequence === false){
				_settings["sequencing"]["approach"] = "random";
				delete _settings["sequencing"]["sequence"];
			} else {
				_settings["sequencing"]["sequence"] = validatedSequence;
			}
		}
	};

	var triggerLO = function(event_id,callback){
		switch(_settings["sequencing"]["interruptions"]){
			case "no_restrictions":
				//Do nothing
				return _triggerLO(event_id,callback);
			case "n_times":
				if(_nshown >= _settings["sequencing"]["interruptions_n"]){
					return _abortTriggerLO(event_id,callback);
				} else {
					return _triggerLO(event_id,callback);
				}
			case "1_per_timeperiod":
				if(typeof _lastLoTimeStamp !== "undefined"){
					var timeSinceLastLo = ((new Date())-_lastLoTimeStamp)/1000; //in seconds
					if(timeSinceLastLo <= _settings["sequencing"]["interruptions_n"]){
						return _abortTriggerLO(event_id,callback);
					}
				}
				return _triggerLO(event_id,callback);
			default:
				//Do nothing
				break;
		}
	};

	var _triggerLO = function(event_id,callback){
		var los_mapped = _getMappedLOs(event_id);
		if(los_mapped.length < 1){
			//This event has no mapped learning objects
			return _abortTriggerLO(event_id,callback);
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

	var _abortTriggerLO = function(event_id,callback){
		if(typeof callback === "function"){
			var report = _getReportWhenNoLOs(event_id);
			callback(report.success,report);
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

		_lastLoTimeStamp = new Date();

		_togglePause();

		//Mark learning object as shown and count the number of times it has been shown
		_settings["los"][lo["id"]]["shown"] = true;
		_settings["los"][lo["id"]]["nshown"] += 1;

		SGAME.Fancybox.create({lo: lo}, function(report){
			// SGAME.Debugger.log("LO report");
			// SGAME.Debugger.log(report);

			//Check if the learning object has been successfully consumed
			if(_settings["los"][lo["id"]]["succesfully_consumed"]!==true){
				_settings["los"][lo["id"]]["succesfully_consumed"] = (report.success);
			}
			if(report.success === true){
				_settings["los"][lo["id"]]["nsuccess"] += 1;
			}

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

			_updateFlagsAndTracking();

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
	 * Return the current settings
	 */
	var getSettings = function(){
		return _settings;
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

	/*
	 * Return 'true' if the reported sucess parameter is 'true' when no learning objects can be shown
	 */
	var successWhenNoLOs = function(event_id){
		return _getSuccessWhenNoLOs(event_id);
	};

	/*
	 * Triggered when connected to a VLE
	 */
	var onConnectedToVLE = function(){
		if(_settings["game_settings"]["completion_status"]==="onstart"){
			_tracking["progress_measure"] = 1;
			_tracking["completion_status"] = "completed";
		}
		if(_settings["game_settings"]["success_status"]==="onstart"){
			_tracking["score"] = 1;
			_tracking["success_status"] = "passed";
		}
		if((_settings["game_settings"]["completion_status"]==="onstart")||(_settings["game_settings"]["success_status"]==="onstart")){
			SGAME.Messenger.sendMessage({key:"tracking", value: _tracking});
			setTimeout(function(){
				if(_shouldShowFinalScreen() === true){
					_togglePause();
					_checkFinalScreen(function(){
						_togglePause();
					});
				}
			},500);
		}
	};

	/*
	 * Retrieve VLE data
	 */
	var getVLEData = function(){
		return _vle_data;
	};

	/*
	 * Set VLE data
	 */
	var setVLEData = function(data){
		_vle_data = data;
		return _vle_data;
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
	 * Update flags: update tracking and check if there are learning objects that can be shown
	 */
	var _updateFlagsAndTracking = function(){
		var lo_ids = Object.keys(_settings["los"]);
		var nLOs = lo_ids.length;
		_nloshown = 0;
		_nshown = 0;
		_nlosuccess = 0;
		_nsuccess = 0;
		_los_can_be_shown = false;

		for(var i=0; i<nLOs;i++){
			if(_settings["los"][lo_ids[i]]["shown"] === true){
				_nloshown += 1;
				_nshown += _settings["los"][lo_ids[i]]["nshown"];
			}
			if(_settings["los"][lo_ids[i]]["succesfully_consumed"] === true){
				_nlosuccess += 1;
				_nsuccess += _settings["los"][lo_ids[i]]["nsuccess"];
			}
			if(_settings["los"][lo_ids[i]]["can_be_shown"] === true){
				_los_can_be_shown = true;
			}
		}

		//Update tracking

		//Progress measure and completion status
		var progress_measure = 0;
		var completion_status = "incompleted"; //values: "completed", "incomplete", "not attempted"
		switch(_settings["game_settings"]["completion_status"]){
			case "all_los":
				//Equivalent to "percentage_los" with n=100
				_settings["game_settings"]["completion_status_n"] = 100;
			case "percentage_los":
				var n_percentage_los_threshold = Math.min(100,Math.max(0,_settings["game_settings"]["completion_status_n"]))/100;
				if((n_percentage_los_threshold <= 0)||(_nLOs <= 0)){
					progress_measure = 1;
				} else {
					progress_measure = (_nloshown/_nLOs)/n_percentage_los_threshold;
				}
				break;
			case "n_los":
				var n_los_threshold = Math.min(_settings["game_settings"]["completion_status_n"],_nLOs);
				if(n_los_threshold === 0){
					progress_measure = 1;
				} else {
					progress_measure = _nloshown/n_los_threshold;
				}
				break;
			case "n_times":
				if(_settings["game_settings"]["completion_status_n"] <= 0){
					progress_measure = 1;
				} else {
					progress_measure = _nshown/_settings["game_settings"]["completion_status_n"];
				}
				break;
			case "onstart":
				progress_measure = 1;
				break;
			case "disabled":
			default:
				break;
		}

		progress_measure = Math.max(Math.min(1,+progress_measure.toFixed(2)),0);
		if(progress_measure === 1){
			completion_status = "completed";
		} else {
			completion_status = "incompleted";
		}
		

		//Score and Success status
		var score = 0;
		var success_status = "unknown"; //values: "unknown", "passed", "failed"
		switch(_settings["game_settings"]["success_status"]){
			case "all_los":
				//Equivalent to "percentage_los" with n=100
				_settings["game_settings"]["success_status_n"] = 100;
			case "percentage_los":
				var n_percentage_los_threshold = Math.min(100,Math.max(0,_settings["game_settings"]["success_status_n"]))/100;
				if((n_percentage_los_threshold <= 0)||(_nLOs <= 0)){
					score = 1;
				} else {
					score = (_nlosuccess/_nLOs)/n_percentage_los_threshold;
				}
				break;
			case "n_los":
				var n_los_threshold = Math.min(_settings["game_settings"]["success_status_n"],_nLOs);
				if(n_los_threshold === 0){
					score = 1;
				} else {
					score = _nloshown/n_los_threshold;
				}
				break;
			case "n_times":
				if(_settings["game_settings"]["success_status_n"] <= 0){
					score = 1;
				} else {
					score = _nsuccess/_settings["game_settings"]["success_status_n"];
				}
				break;
			case "oncompletion":
				score = progress_measure;
				break;
			case "onstart":
				score = 1;
				break;		
			case "disabled":
			default:
				break;
		}

		score = Math.max(Math.min(1,+score.toFixed(2)),0);
		if(score === 1){
			success_status = "passed";
		} else {
			success_status = "failed";
		}
		
		_tracking = {progress_measure: progress_measure, completion_status: completion_status, score: score, success_status: success_status};
		SGAME.Messenger.sendMessage({key:"tracking", value: _tracking});
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
				return (_los_can_be_shown === false);
			case "all_los_consumed":
				return (_nloshown >= _nLOs);
			case "all_los_succesfully_consumed":
				return (_nlosuccess >= _nLOs);
			case "completion_status":
				return _tracking["completion_status"]==="completed";
			case "success_status":
				return _tracking["success_status"]==="passed";
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
	SGAME.Debugger.init(false);
	_loadInitialSettings();
	SGAME.Messenger.init();

	return {
		init 				: init,
		loadSettings		: loadSettings,
		triggerLO			: triggerLO,
		showLO 				: showLO,
		showRandomLO		: showRandomLO,
		closeLO				: closeLO,
		getSettings			: getSettings,
		losCanBeShown		: losCanBeShown,
		successWhenNoLOs	: successWhenNoLOs,
		onConnectedToVLE	: onConnectedToVLE,
		getVLEData			: getVLEData,
		setVLEData			: setVLEData
	};

})();