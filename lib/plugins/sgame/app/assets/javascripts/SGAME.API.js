SGAME.API = (function(){

	var init = function(){
	};

	var requestLOMetadata = function(loId,successCallback,failCallback){
		var serverAPIurl;

		if(typeof loId == "undefined"){
			serverAPIurl = "/lo/random/metadata.json";
		} else {
			serverAPIurl = "/lo/" + loId + "/metadata.json";
		}

		try{
			_XMLHttprequest(serverAPIurl,function(data){
				successCallback(data);
			});
		} catch (e){
			failCallback(e);
		}
	};

	var _XMLHttprequest = function(url,callback){
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function(){
			if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
				var data = JSON.parse(xmlHttp.responseText);
				callback(data);
			}
		};
		xmlHttp.open("GET", url, true);
		xmlHttp.send("");
	};

	return {
		init				: init,
		requestLOMetadata 	: requestLOMetadata
	};

})();