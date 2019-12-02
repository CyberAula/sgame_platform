SGAME.Messenger = (function(){
	
	//Constants
	var VALID_TYPES = ["PROTOCOL","APP"];
	var VALID_ORIGINS = ["SGAME_GATEWAY","SGAME_API"];
	var ORIGIN = "SGAME_API";
	var DESTINATION = "SGAME_GATEWAY";

	//State
	var _initialized = false;
	var _connected = false;


	var init = function(config){
		if(_initialized){
			return;
		}
		_initialized = true;

		//Register listeners
		try {
			if (window.parent.addEventListener){
				window.parent.addEventListener("message", _onMessageReceived, false);
			} else if (window.attachEvent){
				window.parent.attachEvent("message", _onMessageReceived);
			}
		} catch(e){}
	};

	var sendMessage = function(message){
		if((_initialized)&&(_connected)&&(validateMessage(message))){
			_sendMessage(message);
		}
	};

	var _sendMessage = function(message){
		try {
			window.parent.parent.postMessage(message,'*');
		} catch(e){}
	};

	var _onMessageReceived = function(wrapperedMessage){
		if(_validateWrapperedMessage(wrapperedMessage)){
			var message = JSON.parse(wrapperedMessage.data);
			switch(message.type){
				case "PROTOCOL":
					return _onProtocolMessage(message);
				case "APP":
					return _onAppMessage(message);
				default:
					return;
			}
		}
	};

	///////////////
	// Messages
	///////////////

	function IframeMessage(data,type){
		this.data = data || {};
		if(["PROTOCOL","APP"].indexOf(type)!==-1){
			this.type = type;
		} else {
			this.type = "APP";
		}
		this.origin = ORIGIN;
		this.destination = DESTINATION;
	};

	var createMessage = function(data,type){
		return JSON.stringify(new IframeMessage(data,type));
	};

	var _validateWrapperedMessage = function(wrapperedMessage){
		if((typeof wrapperedMessage !== "object")||(typeof wrapperedMessage.data !== "string")){
			return false;
		}
		return validateMessage(wrapperedMessage.data);
	};

	var validateMessage = function(message){
		try {
			var message = JSON.parse(message);
			if((VALID_TYPES.indexOf(message.type)===-1)||(VALID_ORIGINS.indexOf(message.origin)===-1)){
				return false;
			}
		} catch (e){
			return false;
		}
		return true;
	};


	//////////////
	// Protocol
	//////////////

	var _onProtocolMessage = function(protocolMessage){
		if(protocolMessage.data){
			switch(protocolMessage.data.message){
				case "onIframeMessengerHello":
					if(protocolMessage.origin === "SGAME_GATEWAY"){
						//Hello message received from SGAME_GATEWAY
						
						if(_connected!==true){
							_connected = true;

							// Reply to Hello message
							var helloMessage = protocolMessage;
							helloMessage.destination = helloMessage.origin;
							helloMessage.origin = ORIGIN;
							_sendMessage(JSON.stringify(helloMessage));
						}
					}
					break;
				default:
					break;
			}
		}
	};

	//////////////
	// App
	//////////////

	var _onAppMessage = function(appMessage){
		if(appMessage.data){
			//APP Message received with data
			console.log("SGAME API: APP Message received with data:");
			console.log(appMessage.data);
		}
	};
	

	return {
		init 						: 	init,
		createMessage				: 	createMessage,
		validateMessage 			: 	validateMessage,
		sendMessage 				: 	sendMessage
	};

})();