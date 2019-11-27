SGAME_GATEWAY.CORE = (function(){
	
	//SCORM API Wrapper
	var scorm;
	//Indicates if the game is connected to a SCORM-compliant VLE.
	var connected;
	//User data retrieved through SCORM
	var user;
	//Indicates if the game yields a score (TODO: next version)
	var hasScore = false;

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
		//Initial progress value
		updateProgressMeasure(100);
		updateCompletionStatus("completed");
		if(hasScore){
			//Initial score values
			scorm.setvalue('cmi.score.min',(0).toString());
			scorm.setvalue('cmi.score.max',(100).toString());
			updateScore(0);
			updateSuccessStatus("failed");
		}

		//Unload event
		$(window).on("unload",function(){
			onExit();
		});
	};

	var updateProgressMeasure = function(progressMeasure){
		if(typeof progressMeasure == "number"){
			scorm.setvalue('cmi.progress_measure',progressMeasure.toString());
		}
	};

	var updateCompletionStatus = function(completionStatus){
		if(["completed","incomplete","not attempted"].indexof(completionStatus)!==-1){
			scorm.setvalue('cmi.completion_status',completionStatus);
		}
	};

	var updateScore = function(score){
		if(typeof score === "number"){
			score = Math.max(0,Math.min(1,score));
			scorm.setvalue('cmi.score.scaled',score.toString());
			scorm.setvalue('cmi.score.raw',(score*100).toString());
		}
	};

	var updateSuccessStatus = function(successStatus){
		if(["unknown","passed","failed"].indexof(successStatus)!==-1){
			scorm.setvalue('cmi.success_status',successStatus);
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

	var isConnected = function(){
		if((!connected)||(connected==="false")){
			return false;
		}
		return true;
	};


	return {
		init 					: init,
		isConnected 			: isConnected,
		updateProgressMeasure	: updateProgressMeasure,
		updateCompletionStatus	: updateCompletionStatus,
		updateScore				: updateScore,
		updateSuccessStatus		: updateSuccessStatus,
		onExit					: onExit,
		getAPIWrapper 			: getAPIWrapper,
		getLMSAPIInstance 		: getLMSAPIInstance
	};

})();