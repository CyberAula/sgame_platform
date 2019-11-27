SGAME.Utils = (function(){
	var init = function(debugging){
	};

	/*
	 *	Get an random element from box
	 */
	var getRandomElement = function(box){
		if(typeof box == "number"){
			return box; //one single element
		} else {
			return box[_generateRandomNumber(0,box.length-1)];
		}
	};

	/*
	 *	Generate a random number in the [a,b] interval
	 */
	var _generateRandomNumber = function(a,b){
		if((typeof a != "number")||(typeof b != "number")){
			throw { name: "Invalid number format exception" };
		}
		return Math.round(a + Math.random()*(b-a));
	};


	/*
	 * Load a script asynchronously
	 */
	var loadScript = function(scriptSrc,callback){
		if((typeof scriptSrc !== "string")||(typeof callback !== "function")){
			return;
		}

		var head = document.getElementsByTagName('head')[0];
		if(head) {
			var script = document.createElement('script');
			script.setAttribute('src',scriptSrc);
			script.setAttribute('type','text/javascript');

			var loadFunction = function(){
				if((this.readyState == 'complete')||(this.readyState == 'loaded')){
					callback();
				}
			};

			//calling a function after the js is loaded (IE)
			script.onreadystatechange = loadFunction;

			//calling a function after the js is loaded (Firefox)
			script.onload = callback;

			head.appendChild(script);
		}
	};

	var _protocol = undefined;
	var getProtocol = function(){
		if(typeof _protocol !== "undefined"){
			return _protocol;
		}
		var protocol;
		try {
			protocol = document.location.protocol;
		} catch(e){}

		if(typeof protocol === "string"){
			var protocolMatch = protocol.match(/[\w]+/);
			if((protocolMatch instanceof Array)&&(typeof protocolMatch[0] === "string")){
				protocol = protocolMatch[0];
			} else {
				protocol = undefined;
			}
		} 

		if(typeof protocol === "string"){
			_protocol = protocol;
		} else {
			_protocol = "unknown";
		}
		return _protocol;
	};

	var checkUrlProtocol = function(url){
		if(typeof url === "string"){
			var protocolMatch = (url).match(/^https?:\/\//);
			if((protocolMatch instanceof Array)&&(protocolMatch.length === 1)){
				var urlProtocol = protocolMatch[0].replace(":\/\/","");
				var documentProtocol = SGAME.Utils.getProtocol();
				if(urlProtocol !== documentProtocol){
					switch(documentProtocol){
						case "https":
							//Try to load HTTP url over HTTPs
							url = "https" + url.replace(urlProtocol,""); //replace first
							break;
						case "http":
							//Try to load HTTPs url over HTTP
							//Do nothing
							break;
						default:
							//Document is not loaded over HTTP or HTTPs
							break;
					}
				}
			}
		}
		return url;
	};

	return {
		init				: init,
		getRandomElement	: getRandomElement,
		loadScript			: loadScript,
		getProtocol			: getProtocol,
		checkUrlProtocol	: checkUrlProtocol
	};

})();