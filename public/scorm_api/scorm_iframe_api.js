/*
 * SCORM Gateway
 * @version 1.0
 */

SCORM_IFRAME_API = (function(undefined){

	var _initialized = false;
	var _connected = false;
	var _options;
	var _origin = "?";
	var _originId = "?";
	var _listeners;
	var _wapplisteners;
	// _listeners['event'] = callback;

	//Constants
	var VALID_TYPES = ["PROTOCOL","WAPP"];


	///////////////
	// CORE
	//////////////

	var init = function(initOptions){
		_connected = false;

		if(_initialized===false){
			try {
				_origin = window.location.href;
			} catch (e){}
			_originId = _generateOriginId();

			if (window.addEventListener){
				window.addEventListener("message", _onIframeMessageReceived, false);
			} else if (window.attachEvent){
				window.attachEvent("message", _onIframeMessageReceived);
			}
		}
		_initialized = true;

		_options = initOptions || {};

		_listeners = new Array();
		_wapplisteners = new Array();

		registerCallback("onConnect", function(origin){
			//Communication stablished
			// _print(_originId + ": Communication stablished with: " + origin);
			if((_options)&&(typeof _options.callback === "function")){
				_options.callback(origin);
			}
		});

		_initHelloExchange();
	};


	// Messages

	function IframeMessage(type,data,destination,destinationId){
		this.IframeMessage = true;
		this.data = data || {};
		this.origin = _origin;
		this.originId = _originId;
		this.destination = destination || "*";
		if(destinationId){
			this.destinationId = destinationId;
		}
	};

	var _createMessage = function(type,data,destination,destinationId){
		var iframeMessage = new IframeMessage(type,data,destination,destinationId);
		return JSON.stringify(iframeMessage);
	};

	var _validateWrapperedIframeMessage = function(wrapperedIframeMessage){
		if((typeof wrapperedIframeMessage != "object")||(typeof wrapperedIframeMessage.data != "string")){
			return false;
		}
		return _validateIframeMessage(wrapperedIframeMessage.data);
	};

	var _validateIframeMessage = function(iframeMessage){
		try {
			var iframeMessage = JSON.parse(iframeMessage);
			if((iframeMessage.IframeMessage!==true)||(VALID_TYPES.indexOf(iframeMessage.type)==-1)){
				return false;
			}
		} catch (e){
			return false;
		}
		return true;
	};


	// Events and callbacks

	var registerCallback = function(listenedEvent,callback){
		if(callback){
			_listeners[listenedEvent] = callback;
		}
	};

	var unRegisterCallback = function(listenedEvent){
		if((listenedEvent in _listeners)){
			_listeners[listenedEvent] = null;
		}
	};


	// Iframe communication methods

	var sendMessage = function(iframeMessage,iframeId){
		if(!_connected){
			return "Not connected";
		}
		return _sendMessage(iframeMessage,iframeId);
	};

	var _sendMessage = function(iframeMessage,iframeId){
		if(!_validateIframeMessage(iframeMessage)){
			return "Invalid message";
		}
		return window.parent.postMessage(iframeMessage,'*');
	};

	var _onIframeMessageReceived = function(wrapperedIframeMessage){
		if(_validateWrapperedIframeMessage(wrapperedIframeMessage)){
			var iframeMessage = JSON.parse(wrapperedIframeMessage.data);
			if((iframeMessage.destination!=_origin)&&(iframeMessage.destination!=="*")){
				return;
			}
			if((typeof iframeMessage.destinationId != "undefined")&&(iframeMessage.destinationId != _originId)){
				return;
			}
			//Do not process own messages
			if((iframeMessage.origin===_origin)&&(iframeMessage.originId===_originId)){
				return false;
			}
			switch(iframeMessage.type) {
				case "PROTOCOL":
					return _processProtocolMessage(iframeMessage);
				case "WAPP":
					return _processWAPPMessage(iframeMessage);
				default:
					return;
			}
		}
	};

	var _generateOriginId = function(){
		var timestamp = ((new Date()).getTime()).toString();
		var random = (parseInt(Math.random()*1000000)).toString();
		return parseInt(timestamp.substr(timestamp.length-7,timestamp.length-1) + random);
	};


	///////////////
	// PROTOCOL
	//////////////

	var _helloAttempts;
	var MAX_HELLO_ATTEMPTS = 40;
	var _helloTimeout;

	var _initHelloExchange = function(){
		registerCallback("stopHelloExchange", function(){
			if(_helloTimeout){
				clearTimeout(_helloTimeout);
			}
		});

		_helloAttempts = 0;
		_helloTimeout = setInterval(function(){
			_sayHello();
		},1250);

		_sayHello();
	};

	var _sayHello = function(){
		var helloMessage = _createProtocolMessage("onIframeMessengerHello");
		_sendMessage(helloMessage);
		_helloAttempts++;
		if((_helloAttempts>=MAX_HELLO_ATTEMPTS)&&(_helloTimeout)){
			clearTimeout(_helloTimeout);
		}
	};

	var _createProtocolMessage = function(protocolMessage,destination,destinationId){
		var data = {};
		data.message = protocolMessage;
		return _createMessage("PROTOCOL",data,destination,destinationId);
	};

	var _processProtocolMessage = function(protocolMessage){
		if((protocolMessage.data)&&(protocolMessage.data.message === "onIframeMessengerHello")){
			if(!_connected){
				_connected = true;
				if(typeof _listeners["stopHelloExchange"] == "function"){
					_listeners["stopHelloExchange"]();
				}
				if(typeof _listeners["onConnect"] == "function"){
					_listeners["onConnect"](protocolMessage.origin);
				}
			}
		}
	};


	///////////////
	// WAPP Messages
	//////////////

	var _createWAPPMessage = function(method,params,origin,destination,destinationId){
		var data = {};
		data.method = method;
		data.params = params;
		return _createMessage("WAPP",data,destination,destinationId);
	};

	var _processWAPPMessage = function(WAPPMessage){
		var data = WAPPMessage.data;

		if(typeof _wapplisteners[data.method] == "function"){
			_wapplisteners[data.method](data.params);
			_wapplisteners[data.method] = undefined;
		};
	};

	///////////////
	// WAPP API
	//////////////

	var getUser = function(callback){
		_callWAPPMethod("getUser",{},callback);
	};

	var setScore = function(score,callback){
		_callWAPPMethod("setScore",score,callback);
	};

	var setProgress = function(progress,callback){
		_callWAPPMethod("setProgress",progress,callback);
	};

	var setSuccessStatus = function(status,callback){
		_callWAPPMethod("setSuccessStatus",status,callback);
	};

	var setCompletionStatus = function(status,callback){
		_callWAPPMethod("setCompletionStatus",status,callback);
	};

	var _callWAPPMethod = function(methodName,params,callback){
		if(typeof params == "undefined"){
			params = {};
		}
		_wapplisteners[methodName] = callback;
		var WAPPMessage = _createWAPPMessage(methodName,params);
		sendMessage(WAPPMessage);
	};


	///////////
	// Utils
	///////////

	var _print = function(objectToPrint){
		if((console)&&(console.log)){
			console.log(objectToPrint);
		}
	};

	var isConnected = function(){
		return _connected;
	};


	return {
			init 							: init,
			getUser							: getUser,
			setScore						: setScore,
			setProgress						: setProgress,
			setSuccessStatus				: setSuccessStatus,
			setCompletionStatus				: setCompletionStatus,
			isConnected						: isConnected
	};

})();