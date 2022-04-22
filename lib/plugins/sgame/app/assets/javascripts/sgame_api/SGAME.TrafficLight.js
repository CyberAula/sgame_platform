SGAME.TrafficLight = (function(undefined){

	var current_color;
	var changeColorTimer;
	var startBlinkTimer;
	var blinkTimer;
	var stopBlinkTimer;
	var _assetsPath;

	var init = function(assetsPath){
		if(typeof assetsPath === "string"){
			_assetsPath = assetsPath;
		}
	};

	var getCurrentColor = function(){
		return current_color;
	};

	var changeColor = function(color,delay){
		if(delay){
			changeColorTimer = setTimeout(function(){
				_changeColor(color);
			},delay*1000);
		} else {
			_changeColor(color);
		}
	};

	var _changeColor = function(color){
		var trafficLight = document.getElementById("trafficLight");
		if(trafficLight){
			current_color = color;
			trafficLight.src = _getImageForColor(color);
		}
	};

	var _getImageForColor = function(color){
		switch(color){
			case "green":
				return _assetsPath + "trafficLight/trafficLight_green.png";
				break;
			case "yellow":
				return _assetsPath + "trafficLight/trafficLight_yellow.png";
				break;
			case "red":
				return _assetsPath + "trafficLight/trafficLight_red.png";
				break;
			default:
				return _assetsPath + "trafficLight/trafficLight.png";
				break;
		}
	};

	var setUpBlink = function(color,duration,delay){
		if(delay){
			startBlinkTimer = setTimeout(function(){
				_blink(color,duration);
			},delay*1000);
		} else {
			_blink(color,duration);
		}
	};

	var _blink = function(color,duration){
		var trafficLight = document.getElementById("trafficLight");
		if(!trafficLight){
			return;
		}
		var coin = false;
		blinkTimer = setInterval(function(){
			if(!trafficLight){
				return;
			}
			if(coin){
				trafficLight.src = _getImageForColor(null);
				coin = false;
			} else {
				trafficLight.src = _getImageForColor(color);
				coin = true;
			}
		},500);
		stopBlinkTimer = setTimeout(function(){
			clearTimeout(blinkTimer);
		},duration*1000);
	};

	var stop = function(){
		if(changeColorTimer){
			clearTimeout(changeColorTimer);
		}
		if(startBlinkTimer){
			clearTimeout(startBlinkTimer);
		}
		if(blinkTimer){
			clearTimeout(blinkTimer);
		}
		if(stopBlinkTimer){
			clearTimeout(stopBlinkTimer);
		}
	};

	return {
		init 			: init,
		getCurrentColor : getCurrentColor,
		changeColor	: changeColor,
		setUpBlink	: setUpBlink,
		stop 		: stop
	};

}) ();