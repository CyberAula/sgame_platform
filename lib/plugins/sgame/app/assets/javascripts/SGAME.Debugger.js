SGAME.Debugger = (function(){

	var _debugging = false;

	var init = function(debugging){
		if(debugging===true){
			_debugging = debugging;
		}
	};

	var isDebugging = function(){
		return _debugging;
	};

	var log = function(msg){
		if((_debugging)&&(window.console)){
			console.log(msg)
		}
	};

	return {
		init		: init,
		isDebugging	: isDebugging,
		log			: log
	};

})();