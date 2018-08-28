/**
 * SGAME JavaScript API
 * Integrate SCORM compliant Learning Objects into web games
 *
 */

SGAME = (function(){
		
	var init = function(options){
		return SGAME.CORE.init(options);
	};

	var loadSettings = function(settings){
		return SGAME.CORE.loadSettings(settings);
	};

	var triggerLO = function(event_id,callback){
		return SGAME.CORE.triggerLO(event_id,callback);
	};

	var showLO = function(lo,callback){
		return SGAME.CORE.showLO(lo,callback);
	};

	var showRandomLO = function(callback){
		return SGAME.CORE.showRandomLO(callback);
	};

	var closeLO = function(){
		return SGAME.CORE.closeLO();
	};

	var losCanBeShown = function(){
		return SGAME.CORE.losCanBeShown();
	};

	return {
		init 			: init,
		loadSettings	: loadSettings,
		triggerLO		: triggerLO,
		showLO 			: showLO,
		showRandomLO	: showRandomLO,
		closeLO			: closeLO,
		losCanBeShown   : losCanBeShown
	};
})();

SGAME.VERSION = '0.5';
SGAME.AUTHORS = 'Aldo Gordillo, Enrique Barra';
SGAME.URL = "https://github.com/ging/sgame_platform";