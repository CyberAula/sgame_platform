SGAME.TrafficLight = (function(undefined){

	var current_color;
	var changeColorTimer;
	var startBlinkTimer;
	var blinkTimer;
	var stopBlinkTimer;

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
				return "/assets/sgame/trafficLight/trafficLight_green.png";
				break;
			case "yellow":
				return "/assets/sgame/trafficLight/trafficLight_yellow.png";
				break;
			case "red":
				return "/assets/sgame/trafficLight/trafficLight_red.png";
				break;
			default:
				return "/assets/sgame/trafficLight/trafficLight.png";
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
		getCurrentColor : getCurrentColor,
		changeColor	: changeColor,
		setUpBlink	: setUpBlink,
		stop 		: stop
	};

}) ();