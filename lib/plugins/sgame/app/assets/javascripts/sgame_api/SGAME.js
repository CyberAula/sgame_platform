/**
 * SGAME JavaScript API
 * Integrate SCORM compliant Learning Objects into web games
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

	var getSettings = function(){
		return SGAME.CORE.getSettings();
	};

	var losCanBeShown = function(event_id){
		return SGAME.CORE.losCanBeShown(event_id);
	};

	var successWhenNoLOs = function(event_id){
		return SGAME.CORE.successWhenNoLOs(event_id);
	};

	return {
		init 				: init,
		loadSettings		: loadSettings,
		triggerLO			: triggerLO,
		showLO 				: showLO,
		showRandomLO		: showRandomLO,
		closeLO				: closeLO,
		getSettings			: getSettings,
		losCanBeShown   	: losCanBeShown,
		successWhenNoLOs	: successWhenNoLOs
	};
})();

SGAME.VERSION = '0.5';
SGAME.AUTHORS = 'Aldo Gordillo, Enrique Barra';
SGAME.URL = "https://github.com/ging/sgame_platform";