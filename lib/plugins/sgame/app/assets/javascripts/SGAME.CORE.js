SGAME.CORE = (function(){
	
	//SGAME options (provided by the game template)
	var _options = {};
	//Internal vars
	var _togglePauseFunction = undefined;


	//SGAME settings (provided by the SGAME platform)
	var _settings = {};

	//Validations
	var supportedRepeatLo = ["repeat","repeat_unless_successfully_consumed","no_repeat"];
	var supportedCompletionNotification = ["no_more_los","all_los_consumed","all_los_succesfully_consumed","never"];

	//Internal vars
	var _final_screen_shown = false;
	
	//Init debug module for developping
	SGAME.Debugger.init(true);


	/**
	 * SGAME API
	 * 
	 * init
	 * loadSeetings
	 * triggerLO
	 * showLO
	 * closeLO
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

		_settings = settings;

		if(typeof _settings["game_metadata"] === undefined){
			_settings["game_metadata"] = {};
		}
		if(typeof _settings["los"] === undefined){
			_settings["los"] = {};
		}
		if(typeof _settings["events"] === undefined){
			_settings["events"] = {};
		}
		if(typeof _settings["event_mapping"] === undefined){
			_settings["event_mapping"] = {};
		}
		if(typeof _settings["sequencing"] === undefined){
			_settings["sequencing"] = {};
			//Default values
			if(supportedRepeatLo.indexOf(_settings["sequencing"]["repeat_lo"]) !== -1){
				_settings["sequencing"]["repeat_lo"] = "repeat";
			}
		}
		if(typeof _settings["game_settings"] === undefined){
			_settings["game_settings"] = {};
			//Default values
			if(supportedCompletionNotification.indexOf(_settings["game_settings"]["completion_notification"]) !== -1){
				_settings["game_settings"]["completion_notification"] = "never";
			}
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
			}
		}
	};

	var triggerLO = function(event_id,callback){
		var los_mapped = [];
		var los_candidate = [];

		var mapped_los_ids = _settings["event_mapping"][event_id];
		var n_mapped_los_ids = mapped_los_ids.length;
		if((typeof mapped_los_ids !== "undefined")&&(typeof n_mapped_los_ids === "number")){
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

		var nLosMapped = los_mapped.length;
		if(nLosMapped.length < 1){
			//This event has no mapped learning objects
			if(typeof callback == "function"){
				callback(null,null);
			}
			return;
		}

		for(var j=0; j<nLosMapped;j++){
			if(los_mapped[j]["can_be_shown"] === true){
				los_candidate.push(los_mapped[j]);
			}
		}

		if((los_candidate)&&(los_candidate instanceof Array)&&(los_candidate.length > 0)){
			//Choose one of the candidate learning objects
			selectedLO = _selectLoFromCandidates(los_candidate);
			//Show the selected learning object
			showLO(selectedLO,callback);
		} else {
			//No valid candidates for this event
			if(typeof callback == "function"){
				callback(null,null);
			}
		}
	};

	/*
	 * Show a Learning Object
	 */
	var showLO = function(lo,callback){
		if((typeof lo !== "object")||(typeof lo["url"] !== "string")){
			if(typeof callback == "function"){
				callback(null,null);
			}
			return;
		}

		//Mark learning object as shown and count the number of times it has been shown
		_settings["los"][lo["id"]]["shown"] = true;
		_settings["los"][lo["id"]]["nshown"] += 1

		_togglePause();

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

			_checkFinalScreen(function(){
				if(typeof callback == "function"){
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
				var lo_ids = Object.keys(_settings["los"]);
				var nLOs = lo_ids.length;
				for(var i=0; i<nLOs;i++){
					if(_settings["los"][lo_ids[i]]["can_be_shown"] === true){
						return false;
					}
				}
				return true;
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
		
		alert("Final screen"); //TODO

		if(typeof callback === "function"){
			callback(true);
		}
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


	return {
		init 			: init,
		loadSettings	: loadSettings,
		triggerLO		: triggerLO,
		showLO 			: showLO,
		showRandomLO	: showRandomLO,
		closeLO			: closeLO
	};

})();