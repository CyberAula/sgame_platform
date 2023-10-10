SGAME.Analytics = (function(undefined){

	var lrs;
	var actor;
	var gameURL;
	var attemptId;
	var statements;

	var init = function(settings){
		lrs = settings["lrs"];

		if((typeof settings["player"] == "object")&&(typeof settings["player"]["url"] == "string")&&(typeof settings["player"]["name"] == "string")){
			actor = {};
			actor["id"] = settings["player"]["url"];
			actor["name"] = settings["player"]["name"];
		}

		gameURL = settings["game_metadata"]["url"];

		if(typeof settings["attemptId"] == "string"){
			attemptId = settings["attemptId"];
		}

		statements = [];

		recordGameAccessed();
	};

	var onVLEDataReceived = function(data){
		if(typeof data.user === "object"){
			var user = {};
			if(typeof data.user.id === "string"){
				user["id"] = data.user.id;
			}
			if(typeof data.user.name === "string"){
				user["name"] = data.user.name;
			}
			if(Object.keys(user).length > 0){
				if(typeof actor === "undefined"){
					actor = user;
					recordGameAccessed();
				}
			}
		}
	};

	var recordGameAccessed = function(){
		return _createStatement("http://activitystrea.ms/schema/1.0/access",gameURL);
	};

	var recordGameClosed = function(tracking){
		var result = {
			"completion": (tracking.completion_status === "completed"),
			"success": (tracking.success_status === "passed"),
			"score": {
				"scaled": tracking.score
			}
		}
		return _createStatement("http://activitystrea.ms/schema/1.0/close",gameURL,result);
	};

	var recordGameCompleted = function(tracking){
		var result = {
			"completion": (tracking.completion_status === "completed"),
			"success": (tracking.success_status === "passed"),
			"score": {
				"scaled": tracking.score
			}
		}
		return _createStatement("http://activitystrea.ms/schema/1.0/complete",gameURL,result);
	};

	var recordLOAccessed = function(lo){
		return _createStatement("http://activitystrea.ms/schema/1.0/access",lo["url"]);
	};

	var recordLOClosed = function(lo,report){
		var result = {
			"completion": (report.scorm_completion_status === "completed"),
			"success": report.success,
			"score": {
				"scaled": report.scorm_scaled_score
			}
		}
		return _createStatement("http://activitystrea.ms/schema/1.0/close",lo["url"],result);
	};

	var _createStatement = function(verbId,objectId,result,xapi){
		var statement = {};

		if(typeof verbId !== "undefined"){
			statement["verb"] = {
				id: verbId
			};
		}

		if(typeof objectId !== "undefined"){
			statement["object"] = {
				id: objectId
			};
		}

		if(typeof result !== "undefined"){
			statement["result"] = result;
		}

		statement["timestamp"] = iso8601Parser.createTimestamp();

		if(xapi === true){
			statement = _processStatementForXAPI(statement);
		}

		statements.push(statement);

		return statement;
	};

	var _processStatementForXAPI = function(statement){
		if(typeof actor !== "undefined"){
			statement["actor"] = actor;
		}

		var context = {};
		if((typeof statement["object"] == "object")&&(typeof statement["object"]["id"] == "string")){
			if(statement["object"]["id"] != gameURL){
				context["contextActivities"] = {
					"parent": { "id": gameURL }
				}
			}
		}
		if(typeof attemptId === "string"){
			context["extensions"] = {
				"http://id.tincanapi.com/extension/attempt-id": attemptId
			}
		}
		if(Object.keys(context).length > 0){
			statement["context"] = context;
		}
		
		statement["authority"] = {
			"name": SGAME.URL,
			"version": SGAME.VERSION
		}

		return statement;
	};

	var storeAnalytics = function(){
		if(typeof lrs == "undefined"){
			return;
		}

		var analytics = {};
		if(typeof actor !== "undefined"){
			analytics["actor"] = actor;
		}
		if(typeof attemptId === "string"){
			analytics["attemptId"] = attemptId;
		}
		analytics["statements"] = statements;
		
		//TODO: send data to SGAME backend
		//console.log("Generated analytics");
		//console.log(analytics);
	};

	return {
		init 					: init,
		onVLEDataReceived		: onVLEDataReceived,
		recordGameAccessed		: recordGameAccessed,
		recordGameClosed		: recordGameClosed,
		recordGameCompleted		: recordGameCompleted,
		recordLOAccessed		: recordLOAccessed,
		recordLOClosed			: recordLOClosed,
		storeAnalytics			: storeAnalytics
	};

}) ();