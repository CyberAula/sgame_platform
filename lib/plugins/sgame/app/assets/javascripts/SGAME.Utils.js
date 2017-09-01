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

	return {
		init				: init,
		getRandomElement	: getRandomElement,
		loadScript			: loadScript
	};

})();