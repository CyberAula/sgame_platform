/**
 * SGAME JavaScript API
 * Integrate SCORM compliant Learning Objects into web games
 *
 * version 0.3
 */

SGAME = (function(){
		
	var init = function(options){
		SGAME.CORE.init(options);
	};

	var loadSettings = function(settings){
		SGAME.CORE.loadSettings(settings);
	};

	var triggerLO = function(event_id,callback){
		SGAME.CORE.triggerLO(event_id,callback);
	};

	var showLO = function(lo,callback){
		SGAME.CORE.showLO(lo,callback);
	};

	var showRandomLO = function(callback){
		SGAME.CORE.showRandomLO(callback);
	};

	var closeLO = function(){
		SGAME.CORE.closeLO();
	};

	return {
		init 			: init,
		loadSettings	: loadSettings,
		triggerLO		: triggerLO,
		showLO 			: showLO,
		showRandomLO	: showRandomLO,
		closeLO			: closeLO
	};
})();

SGAME.VERSION = '0.4';
SGAME.AUTHORS = 'Aldo Gordillo, Enrique Barra';
SGAME.URL = "https://github.com/ging/sgame_platform";