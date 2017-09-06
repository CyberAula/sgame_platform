//SCORM LMS APIs
var API;
var API_1484_11;

SGAME.Fancybox = (function(undefined){

	var _currentFancybox = undefined;
	var _currentOnCloseCallback = undefined;

	var init = function(){
	};

	var create = function(options,onCloseCallback){
		_removeCurrentFancybox();
		_currentOnCloseCallback = onCloseCallback;
		
		//Params
		var width = 850;
		var height = 650;
		var lo = {};
		var url;
		
		if(options){
			if(options.width){
				width = options.width;
			}
			if(options.height){
				height = options.height;
			}
			if(options.lo){
				lo = options.lo;
			}
			if(typeof lo["url"] == "string"){
				url = lo["url"];
			}
		}

		var maxHeight = window.innerHeight - 8;
		var maxWidth = window.innerWidth - 8;
		height = Math.min(height,maxHeight);
		width = Math.min(width,maxWidth);

		//Params Validation
		if((typeof url != "string")||(typeof lo.scorm_type == "undefined")){
			return;
		}

		var SCORM_API = undefined;
		API = undefined;
		API_1484_11 = undefined;
		if(lo.scorm_type === "sco"){
			if(lo.scorm_version === "1.2"){
				API = new Local_API_SCORM_12({debug: SGAME.Debugger.isDebugging()},jqSGAME);
				SCORM_API = API;
			} else if(lo.scorm_version === "2004"){
				//Create new SCORM LMS API
				API_1484_11 = new Local_API_1484_11({debug: SGAME.Debugger.isDebugging()},jqSGAME);
				SCORM_API = API_1484_11;
			}
		}

		var fancybox = document.createElement('div');
		fancybox.style.width = width + "px";
		fancybox.style.height = height + "px";
		fancybox.style.maxWidth = maxWidth + "px";
		fancybox.style.maxHeight = maxHeight + "px";
		fancybox.style.overflow = "hidden";
		fancybox.style.background = 'white';
		fancybox.style.position = "absolute";
		fancybox.style.top = 0;
		fancybox.style.zIndex = 9999;
		fancybox.style.borderRadius = '1em';
		fancybox.style.border = "2px solid black";
		fancybox.setAttribute('id', "sgame_fancybox");

		var marginLeft = (window.innerWidth - width)/2;
		fancybox.style.marginLeft = marginLeft + "px";

		var marginTop = (window.innerHeight - height)/2;
		fancybox.style.marginTop = marginTop + "px";

		//Close button
		var closeButton = document.createElement('img');
		closeButton.src = "/assets/sgame/close.png";
		closeButton.style.width = "25px";
		closeButton.style.height = "25px";
		closeButton.style.padding = "5px";
		closeButton.style.cursor = "pointer";
		closeButton.style.position = "absolute";
		closeButton.style.right = 0;
		closeButton.onclick = function(){
			closeCurrentFancybox();
			// SGAME.closeLO();
		}
		fancybox.appendChild(closeButton);

		var trafficLight = document.createElement('img');
		trafficLight.id = "trafficLight";
		trafficLight.src = "/assets/sgame/trafficLight/trafficLight_red.png";
		trafficLight.style.width = "45px";
		trafficLight.style.height = "40px";
		trafficLight.style.padding = "5px";
		trafficLight.style.position = "absolute";
		// trafficLight.style.right = "-5px";
		// trafficLight.style.top = "32px";
		trafficLight.style.left = "0px";
		trafficLight.style.top = "0px";
		fancybox.appendChild(trafficLight);

		//Iframe
		var iframe = document.createElement('iframe');
		iframe.src = url;
		iframe.style.width = "94%";
		iframe.style.height = "94%";
		iframe.style.marginLeft = "3%";
		iframe.style.marginTop = "3%";
		iframe.style.overflow = "hidden";
		iframe.style.overflowY = "auto";
		iframe.scrolling = "yes";
		iframe.style.frameBorder = "0";
		iframe.style.borderStyle="none";
		iframe.setAttribute('allowfullscreen', 'false');
		fancybox.appendChild(iframe);

		_currentFancybox = fancybox;
		document.body.appendChild(fancybox);

		//Add observer
		SGAME.Observer.start(iframe,lo,SCORM_API);
	};

	var _removeCurrentFancybox = function(){
		if(typeof _currentFancybox == "undefined"){
			return;
		}
		//Hide fancybox
		_currentFancybox.style.display = "none";
		//Remove fancybox
		_currentFancybox.parentNode.removeChild(_currentFancybox);
		_currentFancybox = undefined;
		API = undefined;
		API_1484_11 = undefined;
	};

	var closeCurrentFancybox = function(){
		_removeCurrentFancybox();
		var report = SGAME.Observer.stop(); //Stop the observer and get final report
		if(typeof _currentOnCloseCallback === "function"){
			_currentOnCloseCallback(report);
		}
		_currentOnCloseCallback = undefined;
	};

	return {
		init 					: init,
		create					: create,
		closeCurrentFancybox	: closeCurrentFancybox
	};

}) ();