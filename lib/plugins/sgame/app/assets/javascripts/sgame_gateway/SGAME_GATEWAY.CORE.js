SGAME_GATEWAY.CORE = (function(){
	
	//SCORM API Wrapper
	var scorm;
	//Indicates if the game is connected to a SCORM-compliant VLE.
	var connected;
	//User data retrieved through SCORM
	var user;
	//Current tracking data
	var currentProgressMeasure = undefined;
	var currentScore = undefined;
	var currentCompletionStatus = undefined;
	var currentSuccessStatus = undefined;
	//Tracking data commited
	var lastProgressMeasure = undefined;
	var lastScore = undefined;
	var lastCompletionStatus = undefined;
	var lastSuccessStatus = undefined; 

	/*
	 * Init function
	 */
	var init = function(){
		//Init SGAME VLE Gateway
		scorm = new SCORM_API({debug: false, windowDebug: false, exit_type: ""});
		connected = scorm.initialize();
		scorm.debug("Connected: " + connected,4);
		
		if(!isConnected()){
			return;
		}

		//Init User model
		var learnerName = scorm.getvalue('cmi.learner_name');
		var learnerId = scorm.getvalue('cmi.learner_id');
		user = {name: learnerName, id: learnerId};
		
		//Init progress tracking
		//Initial progress value and completion status
		_updateProgressMeasure(0);
		_updateCompletionStatus("incompleted");

		//Init score is called by the Messenger module when SGAME settings are received

		//Unload event
		$(window).on("unload",function(){
			onExit();
		});

		//Init messenger for connecting with the SGAME API
		SGAME_GATEWAY.Messenger.init();
	};

	var initScore = function(){
		//Initial score values
		scorm.setvalue('cmi.score.min',(0).toString());
		scorm.setvalue('cmi.score.max',(100).toString());
		_updateScore(0);
		_updateSuccessStatus("failed");
	};


	var updateTrackingData = function(progressMeasure, score, completionStatus, successStatus){
		if(isConnected()===false){
			return; //Abort if not connected with a SCORM environment
		}

		_updateProgressMeasure(progressMeasure);
		_updateScore(score);
		_updateCompletionStatus(completionStatus);
		_updateSuccessStatus(successStatus);

		var shouldCommit = false;
		if((typeof platform !== "undefined")&&(platform.name === "Chrome")){
			//Fix for Chrome 80+ in some Moodle versions (https://tracker.moodle.org/browse/MDL-67175)
			var shouldCommitProgressMeasure = (currentProgressMeasure > 0) && ((typeof lastProgressMeasure == "undefined")||(currentProgressMeasure != lastProgressMeasure));
			var shouldCommitScore =(currentScore > 0) && ((typeof lastScore == "undefined")||(currentScore != lastScore));
			var shouldCommitCompletionStatus = (currentCompletionStatus === "completed") && (currentCompletionStatus != lastCompletionStatus);
			var shouldCommitSuccessStatus = (currentSuccessStatus !== "unknown") && (currentSuccessStatus != lastSuccessStatus) && ((currentProgressMeasure > 0)||(currentScore > 0));
			shouldCommit = ((shouldCommitProgressMeasure)||(shouldCommitScore)||(shouldCommitCompletionStatus)||(shouldCommitSuccessStatus));
		}

		if(shouldCommit){
			lastProgressMeasure = currentProgressMeasure;
			lastScore = currentScore;
			lastCompletionStatus = currentCompletionStatus;
			lastSuccessStatus = currentSuccessStatus;
			scorm.commit();
		}
	};

	var _updateProgressMeasure = function(progressMeasure){
		if(typeof progressMeasure === "number"){
			progressMeasure = Math.max(0,Math.min(1,progressMeasure));
			scorm.setvalue('cmi.progress_measure',progressMeasure.toString());
			currentProgressMeasure = progressMeasure;
		}
	};

	var _updateCompletionStatus = function(completionStatus){
		if((typeof completionStatus === "string")&&(["completed","incomplete","not attempted"].indexOf(completionStatus)!==-1)){
			scorm.setvalue('cmi.completion_status',completionStatus);
			currentCompletionStatus = completionStatus;
		}
	};

	var _updateScore = function(score){
		if(typeof score === "number"){
			score = Math.max(0,Math.min(1,score));
			scorm.setvalue('cmi.score.scaled',score.toString());
			scorm.setvalue('cmi.score.raw',(score*100).toString());
			currentScore = score;
		}
	};

	var _updateSuccessStatus = function(successStatus){
		if((typeof successStatus === "string")&&(["unknown","passed","failed"].indexOf(successStatus)!==-1)){
			scorm.setvalue('cmi.success_status',successStatus);
			currentSuccessStatus = successStatus;
		}
	};

	var onExit = function(){
		// scorm.commit(); terminate will call commit
		scorm.terminate();
	};

	var getAPIWrapper = function(){
		if(connected){
			return scorm;
		} else {
			return undefined;
		}	
	};

	var getLMSAPIInstance = function(){
		if((connected)&&(scorm)&&(scorm.API)&&((scorm.API.path))){
			return scorm.API.path;
		} else {
			return undefined;
		}		
	};

	var getUser = function(){
		return user;
	};

	var isConnected = function(){
		if((!connected)||(connected==="false")){
			return false;
		}
		return true;
	};


	return {
		init 					: init,
		isConnected 			: isConnected,
		initScore				: initScore,
		updateTrackingData		: updateTrackingData,
		onExit					: onExit,
		getUser					: getUser,
		getAPIWrapper 			: getAPIWrapper,
		getLMSAPIInstance 		: getLMSAPIInstance
	};

})();