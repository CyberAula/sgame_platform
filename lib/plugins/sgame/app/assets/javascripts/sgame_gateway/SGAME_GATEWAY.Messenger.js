SGAME_GATEWAY.Messenger = (function(){
	
	//Constants
	var VALID_TYPES = ["PROTOCOL","APP"];
	var VALID_ORIGINS = ["SGAME_GATEWAY","SGAME_API"];
	var ORIGIN = "SGAME_GATEWAY";
	var DESTINATION = "SGAME_API";

	//State
	var _initialized = false;
	var _connected = false;
	var _helloAttempts = 0;
	var MAX_HELLO_ATTEMPTS = 40;
	var _helloTimeout;


	var init = function(config){
		if(_initialized){
			return;
		}
		_initialized = true;

		//Register listeners
		if (window.addEventListener){
			window.addEventListener("message", _onMessageReceived, false);
		} else if (window.attachEvent){
			window.attachEvent("message", _onMessageReceived);
		}

		//Connect with SGAME API
		_initHelloExchange();
	};

	var _onConnection = function(){
		//Send initial data (user profile)
		var user = SGAME_GATEWAY.CORE.getUser();
		sendMessage({"key":"lms_data", "value": user});
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

	var sendMessage = function(data){
		if((_initialized)&&(_connected)){
			var message = _createMessage(data);
			if(_validateMessage(message)){
				_sendMessage(message);
			}
		}
	};

	var _createMessage = function(data,type){
		return JSON.stringify(new IframeMessage(data,type));
	};

	var _sendMessage = function(message){
		$("iframe.sgame_instance").each(function(index,iframe){
			_sendMessageToIframe(message,iframe);
		});
	};

	var _sendMessageToIframe = function(message,iframe){
		if((iframe)&&(iframe.contentWindow)){
			iframe.contentWindow.postMessage(message,'*');
		}
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

	var _validateWrapperedMessage = function(wrapperedMessage){
		if((typeof wrapperedMessage !== "object")||(typeof wrapperedMessage.data !== "string")){
			return false;
		}
		return _validateMessage(wrapperedMessage.data);
	};

	var _validateMessage = function(message){
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
					if(protocolMessage.origin === "SGAME_API"){
						//Hello message received from SGAME API
						
						//Stop sending protocol messages
						if(_helloTimeout){
							clearTimeout(_helloTimeout);
						}

						if(_connected!==true){
							_connected = true;

							// Reply to Hello message
							var helloMessage = protocolMessage;
							helloMessage.destination = helloMessage.origin;
							helloMessage.origin = ORIGIN;
							_sendMessage(JSON.stringify(helloMessage));

							_onConnection();
						}
					}
					break;
				default:
					break;
			}
		}
	};

	var _initHelloExchange = function(){
		_helloAttempts = 0;
		_helloTimeout = setInterval(function(){
			_sayHello();
		},1250);
		_sayHello();
	};

	var _sayHello = function(){
		var helloMessage = _createMessage({"message":"onIframeMessengerHello"},"PROTOCOL");
		_sendMessage(helloMessage);
		_helloAttempts++;
		if((_helloAttempts>=MAX_HELLO_ATTEMPTS)&&(_helloTimeout)){
			clearTimeout(_helloTimeout);
		}
	};


	//////////////
	// App
	//////////////

	var _onAppMessage = function(appMessage){
		if(appMessage.data){
			//APP Message received with data
			//console.log("VLE GATEWAY: APP Message received with data:");
			//console.log(appMessage.data);
		}
	};
	

	return {
		init 						: 	init,
		sendMessage 				: 	sendMessage
	};

})();