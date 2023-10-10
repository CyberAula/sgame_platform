SGAME.Analytics = (function(undefined){

	var actor;
	var gameURL;
	var statements;

	var init = function(settings){
		if((typeof settings["player"] == "object")&&(typeof settings["player"]["url"] == "string")&&(typeof settings["player"]["name"] == "string")){
			actor = {};
			actor["id"] = settings["player"]["url"];
			actor["name"] = settings["player"]["name"];
		}
		gameURL = settings["game_metadata"]["url"];
		statements = [];

		_createInitialStatement();
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
				actor = user;
				_createInitialStatement();
			}
		}
	};

	var _createInitialStatement = function(){
		return _createStatement(actor,"accessed",gameURL);
	};

	var _createStatement = function(actorId,verbId,objectId,result,context){
		
		// xAPI example
		// var statement = {
		// 	{
		// 	  "actor": {
		// 	    "id": "Sally Glider",
		// 	  },
		// 	  "verb": {
		// 	    "id": "http://adlnet.gov/expapi/verbs/experienced",
		// 	    "display": { "en-US": "experienced" }
		// 	  },
		// 	  "object": {
		// 	    "id": "http://example.com/activities/solo-hang-gliding",
		// 	    "definition": {
		// 	      "name": { "en-US": "Solo Hang Gliding" }
		// 	    }
		// 	  },
		// 	  "result": {
		// 	    "completion": true,
		// 	    "success": true,
		// 	    "score": {
		// 	      "scaled": .95
		// 	    }
		// 	  },
  		// 	  "context": {
		// 	    "instructor": {
		// 	      "name": "Irene Instructor",
		// 	      "mbox": "mailto:irene@example.com"
		// 	    },
		// 	    "contextActivities":{
		// 	      "parent": { "id": "http://example.com/activities/hang-gliding-class-a" }
		// 	      "grouping": { "id": "http://example.com/activities/hang-gliding-school" }
		// 	    },
		// 	    "extensions": {
		// 	      "http://example.com/weatherConditions": "rainy"
		// 	    }
		// 	  },
		// 	  "timestamp": "2012-07-05T18:30:32.360Z",
		// 	  "stored": "2012-07-05T18:30:33.540Z",
		// 	  "authority": {
		// 	    "name": "Irene Instructor",
		// 	    "mbox": "mailto:irene@example.com"
		// 	  }
		// 	}
		// };

		var statement = {};

		if(typeof actorId !== "undefined"){
			statement["actor"] = { 
				id: actorId
			};
		}

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

		if(typeof context !== "undefined"){
			statement["context"] = context;
		}

		statement["timestamp"] = iso8601Parser.createTimestamp();

		statements.push(statement);

		console.log("Recorded statement");
		console.log(statement);
	};

	return {
		init 			      : init,
		onVLEDataReceived     : onVLEDataReceived
	};

}) ();