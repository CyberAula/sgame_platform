//SCORM LMS APIs
var API;
var API_1484_11;

SGAME.Fancybox = (function(undefined){

	var _currentFancybox = undefined;
	var _currentFancyboxMode = undefined;
	var _currentOnCloseCallback = undefined;

	var init = function(){
	};

	var create = function(options,onCloseCallback){
		_removeCurrentFancybox();
		_currentOnCloseCallback = onCloseCallback;
		
		//Params
		var mode = ((typeof options !== "undefined" && options.dialog===true) ? "dialog" : "lo"); //Mode can be "dialog" or "lo"

		var ar = 4/3;
		var minMargin = 0.05;
		var width;
		var height;
		var maxWidth = (window.innerWidth * (1-2*minMargin));
		var maxHeight = (window.innerHeight * (1-2*minMargin));

		if(maxHeight * ar > maxWidth){
			//Limit height
			width = maxWidth;
			height = width/ar;
		} else {
			//Limit width
			height = maxHeight;
			width = height * ar;
		}

		if(mode === "lo"){
			//Params for LO mode
			var lo = {};
			var url;
		} else {
			//Params for dialog mode
			var dialogMsg = "";
		}
		
		if(options){
			if(options.width){
				width = options.width;
			}
			if(options.height){
				height = options.height;
			}
			if(mode === "lo"){
				if(options.lo){
					lo = options.lo;
					if(typeof lo["url"] === "string"){
						url = lo["url"];
					}
				}
			} else {
				if(typeof options.msg == "string"){
					dialogMsg = options.msg;
				}
			}
		}

		if(mode === "lo"){
			//Params Validation
			if((typeof url != "string")||(typeof lo.scorm_type == "undefined")){
				return;
			}

			var SCORM_API = undefined;
			API = undefined;
			API_1484_11 = undefined;
			if(lo.scorm_type === "sco"){
				if(lo.scorm_version === "1.2"){
					API = new Local_API_SCORM_12({debug: SGAME.Debugger.isDebugging()});
					SCORM_API = API;
				} else if(lo.scorm_version === "2004"){
					//Create new SCORM LMS API
					API_1484_11 = new Local_API_1484_11({debug: SGAME.Debugger.isDebugging()});
					SCORM_API = API_1484_11;
				}
			}
		}

		var fancybox = document.createElement('div');
		fancybox.style.width = width + "px";
		fancybox.style.height = height + "px";
		fancybox.style.maxWidth = maxWidth + "px";
		fancybox.style.maxHeight = maxHeight + "px";
		fancybox.style.overflow = ((mode === "lo") ? "hidden" : "auto");
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
		var closeButtonDimension = Math.max(25,Math.floor(height*0.05));
		closeButton.style.width = closeButtonDimension + "px";
		closeButton.style.height = closeButtonDimension + "px";
		closeButton.style.padding = "5px";
		closeButton.style.cursor = "pointer";
		closeButton.style.position = "absolute";
		closeButton.style.right = 0;
		closeButton.onclick = function(){
			closeCurrentFancybox();
		}
		fancybox.appendChild(closeButton);

		if(mode === "lo"){
			var trafficLight = document.createElement('img');
			trafficLight.id = "trafficLight";
			trafficLight.src = "/assets/sgame/trafficLight/trafficLight_red.png";
			var trafficLightHeight = Math.max(40,Math.floor(height*0.085));
			var trafficLightWidth = Math.max(30,Math.floor(trafficLightHeight*0.75)); //AR is 40/30=0,75
			trafficLight.style.height = trafficLightHeight +"px";
			trafficLight.style.width = trafficLightWidth +"px";
			trafficLight.style.padding = "4px";
			trafficLight.style.position = "absolute";
			trafficLight.style.left = "0px";
			trafficLight.style.top = "0px";
			trafficLight.style.background = "#fff";
			trafficLight.style.borderRadius = "0px 0px 20px 0px";
			trafficLight.style.borderRight = "2px solid black";
			trafficLight.style.borderBottom = "2px solid black";
			fancybox.appendChild(trafficLight);

			//Iframe
			var iframe = document.createElement('iframe');
			iframe.src = url;
			var iframeMarginTop = Math.ceil(Math.max(closeButtonDimension,trafficLightHeight)) + 4;
			var iframeMarginBottom = Math.floor(height*0.02);
			var iframeMarginLeft = Math.floor(width*0.02);
			var iframeMarginRight = iframeMarginLeft;
			iframe.style.marginLeft = iframeMarginLeft + "px";
			iframe.style.marginTop = iframeMarginTop + "px";
			iframe.style.width = Math.max(0,(width - iframeMarginLeft - iframeMarginRight)) + "px";
			iframe.style.height = Math.max(0,(height - iframeMarginTop - iframeMarginBottom)) + "px";
			iframe.style.overflow = "auto";
			iframe.scrolling = "yes";
			iframe.style.frameBorder = "0";
			iframe.style.borderStyle="none";
			iframe.setAttribute('allowfullscreen', 'false');
			fancybox.appendChild(iframe);
		} else {
			//Mode dialog
			var dialog = document.createElement('p');
			dialog.id = "dialog";
			dialog.innerHTML = dialogMsg;
			dialog.style.padding = "15px";
			dialog.style.marginTop = "30px";
			dialog.style.marginBottom = "20px";
			dialog.style.marginRight = "20px";
			dialog.style.marginLeft = "20px";
			dialog.style.textAlign = "center";
			dialog.style.fontSize = "24px";
			dialog.style.position = "relative";
			dialog.style.cursor = "default";
			dialog.style.color = "#000";
			dialog.style.fontFamily='initial';
			fancybox.appendChild(dialog);
		}

		_currentFancybox = fancybox;
		_currentFancyboxMode = mode;
		document.body.appendChild(fancybox);

		if(mode === "lo"){
			//Add observer
			SGAME.Observer.start(iframe,lo,SCORM_API);
		}
	};

	var _removeCurrentFancybox = function(){
		if(typeof _currentFancybox == "undefined"){
			return;
		}

		//Hide fancybox
		_currentFancybox.style.display = "none";
		//Remove fancybox
		_currentFancybox.parentNode.removeChild(_currentFancybox);
		
		if(_currentFancyboxMode === "lo"){
			API = undefined;
			API_1484_11 = undefined;
		}
		_currentFancybox = undefined;
		_currentFancyboxMode = undefined;
	};

	var closeCurrentFancybox = function(){
		if(typeof _currentFancybox == "undefined"){
			return;
		}

		var closedFancyboxMode = _currentFancyboxMode; //Save value before removing fancybox
		_removeCurrentFancybox();

		var callbackResult;
		if(closedFancyboxMode === "lo"){
			callbackResult = SGAME.Observer.stop(); //Stop the observer and get final report
		} else {
			callbackResult = true; //Return from dialog
		}

		var currentOnCloseCallback = _currentOnCloseCallback;
		_currentOnCloseCallback = undefined;

		setTimeout(function(){
			if(typeof currentOnCloseCallback === "function"){
				currentOnCloseCallback(callbackResult);
			}
		},50);
	};

	return {
		init 					: init,
		create					: create,
		closeCurrentFancybox	: closeCurrentFancybox
	};

}) ();