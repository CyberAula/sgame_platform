SGAME.Observer = (function(undefined){

	var _stopped = true;
	var _current_iframe = undefined;
	var _current_lo = undefined;
	var _SCORM_API = undefined;

	//Params
	var startTime;
	var success;
	// SCORM reported data
	var scorm_success_status;
	var scorm_scaled_score;
	var scorm_completion_status;
	var scorm_progress_measure;

	//Settings
	var scorm_scaled_score_threshold = 0.8;

	var start = function(iframe,lo,SCORM_API){
		if((_stopped === false)||(typeof _current_iframe != "undefined")){
			return null;
		}
		_stopped = false;

		_resetParams();
		_current_iframe = iframe;
		_current_lo = lo;
		_SCORM_API = SCORM_API;

		_loadEvents();

		SGAME.TrafficLight.changeColor("red");

		if(_current_lo.acts_as_asset === true){
			var requiredTime = _getRequiredTime(_current_lo);
			// SGAME.Debugger.log("Required Time: " + requiredTime);
			SGAME.TrafficLight.setUpBlink("yellow",requiredTime*0.5-0.5,requiredTime*0.5);
			SGAME.TrafficLight.changeColor("green",requiredTime);
		}
	};

	var _resetParams = function(){
		_current_iframe = undefined;
		_current_lo = undefined;
		_SCORM_API = undefined;
		startTime = Date.now();
		success = false;
		scorm_success_status = undefined;
		scorm_scaled_score = undefined;
		scorm_completion_status = undefined;
		scorm_progress_measure = undefined;
	};

	var _loadEvents = function(){
		if((_current_lo.acts_as_asset === false)&&(typeof _SCORM_API !== "undefined")){
			_SCORM_API.addListener("cmi.success_status", function(value){
				scorm_success_status = value;
				if(scorm_success_status==="passed"){
					// SGAME.Debugger.log("SCORM LISTENER: cmi.success_status passed");
					if(SGAME.TrafficLight.getCurrentColor()!="green"){
						SGAME.TrafficLight.stop();
						SGAME.TrafficLight.changeColor("green");
					}
				}
			});
			_SCORM_API.addListener("cmi.score.scaled", function(value){
				scorm_scaled_score = value;
				if(scorm_scaled_score >= scorm_scaled_score_threshold){
					// SGAME.Debugger.log("SCORM LISTENER: cmi.score.scaled >= threshold");
					if(SGAME.TrafficLight.getCurrentColor()!="green"){
						SGAME.TrafficLight.stop();
						SGAME.TrafficLight.changeColor("green");
					}
				}
			});
			_SCORM_API.addListener("cmi.completion_status", function(value){
				scorm_completion_status = value;
				// SGAME.Debugger.log("SCORM LISTENER: cmi.completion_status " + value);
			});
			_SCORM_API.addListener("cmi.progress_measure", function(value){
				scorm_progress_measure = value;
				// SGAME.Debugger.log("SCORM LISTENER: cmi.progress_measure " + value);
			});
		}
	};

	/*
	 * Stop and get report
	 */
	var stop = function(){
		if((_stopped === true)||(typeof _current_iframe == "undefined")){
			return null;
		}
		_stopped = true;

		SGAME.TrafficLight.stop();

		var time_spent = Math.round((Date.now() - startTime)/1000);
		success = (SGAME.TrafficLight.getCurrentColor()==="green");

		var report = {
			lo_metadata: _current_lo,
			time: time_spent,
			success: success
		};

		if(typeof scorm_success_status != "undefined"){
			report["scorm_success_status"] = scorm_success_status;
		}
		if(typeof scorm_scaled_score != "undefined"){
			report["scorm_scaled_score"] = scorm_scaled_score;
		}
		if(typeof scorm_completion_status != "undefined"){
			report["scorm_completion_status"] = scorm_completion_status;
		}
		if(typeof scorm_progress_measure != "undefined"){
			report["scorm_progress_measure"] = scorm_progress_measure;
		}

		_resetParams();

		return report;
	};

	var isStopped = function(){
		return _stopped;
	};

	var _getTypicalLearningTime = function(metadata){
		if(metadata.educational){
			if(metadata.educational.typicalLearningTime){
				if(metadata.educational.typicalLearningTime.duration){
					var TLT = metadata.educational.typicalLearningTime.duration;
					var parsedTLT = iso8601Parser.getDuration(TLT);
					if(parsedTLT){
						//parsedTLT will be null if is not a valid ISO 8601 duration
						//Otherwise, parsedTLT will be the duration in seconds
						return parsedTLT;
					}
				}
			}
		}
		return null;
	};

	/*
	 * Success when the player spent more than 50% of the TLT time
	 * A maximum and a minimum thresholds are considered
	 */
	var _getRequiredTime = function(lo){
		var defaultTime = 15;
		var maximumTime = 120;
		var alfa = 0.5;

		//Get Typical Learning Time (in seconds)
		//null if is not specified in the metadata
		var TLT = _getTypicalLearningTime(lo["lom_metadata"]);
		if((!TLT)||(TLT <= 0)){
			return defaultTime;
		}
		return Math.min(alfa*TLT,maximumTime);
	};

	return {
		start		: start,
		stop		: stop,
		isStopped	: isStopped
	};

}) ();