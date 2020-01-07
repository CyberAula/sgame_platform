/**
 * SGAME VLE Gateway
 * API used to communicate SGAME-compliant games with SCORM-compliant VLE environments
 */

SGAME_GATEWAY = (function(){

	var init = function(){
		SGAME_GATEWAY.CORE.init();
        return;
	};

	return {
		init : init
	};
})();

SGAME_GATEWAY.VERSION = '0.1';
SGAME_GATEWAY.AUTHORS = 'Aldo Gordillo';
SGAME_GATEWAY.URL = "https://github.com/ging/sgame_platform";

function ready(callback){
    if (document.readyState==='complete'){
    	// Document is already loaded
    	callback();
    } else if (document.addEventListener){
    	// Wait for document to be loaded (modern browsers)
    	document.addEventListener('readystatechange', function(event){
    		if (document.readyState==='complete'){
    			callback();
    		}
    	});
    } else {
    	// Wait for document to be loaded (IE <= 8)
    	document.attachEvent('onreadystatechange', function(){
        	if (document.readyState==='complete'){
        		callback();
        	} 
    	});
    }
}

ready(function(){
    SGAME_GATEWAY.init();
});