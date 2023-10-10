//////////////
// ISO 8601 parser
//////////////

/*
* Original version was published under [Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0.html)
* by Nezasa at https://github.com/nezasa/iso8601-js-period/blob/master/iso8601.js.
* 
* Javascript library for managing ISO 8601 durations and timestamps.
* Supported are durations of the form P3Y6M4DT12H30M17S, PT1S, P1Y4DT1H3S, etc.
*/

iso8601Parser = (function(undefined){

	var getDuration = function(period){
		var multiplicators = [ 31104000,2592000,604800,86400,3600,60,1];
		/*
			var multiplicators = [year (360*24*60*60),month (30*24*60*60),
        	week (24*60*60*7),day (24*60*60),hour (60*60),minute (60),second (1)];
        */

        try {
        	var durationPerUnit = _parsePeriodString(period);
        } catch (e){
        	return null;
        }
		
		var durationInSeconds = 0;
		for (var i = 0; i < durationPerUnit.length; i++) {
			durationInSeconds += durationPerUnit[i] * multiplicators[i];
		}

		return durationInSeconds;
	};

   /**
	* Parses a ISO8601 period string.
	* @param period iso8601 period string
	* @param _distributeOverflow if 'true', the unit overflows are merge into the next higher units.
	*/
    function _parsePeriodString(period, _distributeOverflow) {
        var distributeOverflow = (_distributeOverflow) ? _distributeOverflow : false;
        var valueIndexes = [2, 3, 4, 5, 7, 8, 9];
        var duration = [0, 0, 0, 0, 0, 0, 0];
        var overflowLimits = [0, 12, 4, 7, 24, 60, 60];
        var struct;

        // upcase the string just in case people don't follow the letter of the law
        period = period.toUpperCase();

        // input validation
        if (!period) {
        	return duration;
		} else if (typeof period !== "string"){
			throw new Error("Invalid iso8601 period string '" + period + "'");
		} 

        // parse the string
        if (struct = /^P((\d+Y)?(\d+M)?(\d+W)?(\d+D)?)?(T(\d+H)?(\d+M)?(\d+S)?)?$/.exec(period)) {
            // remove letters, replace by 0 if not defined
            for (var i = 0; i < valueIndexes.length; i++) {
                var structIndex = valueIndexes[i];
                duration[i] = struct[structIndex] ? +struct[structIndex].replace(/[A-Za-z]+/g, '') : 0;
            }
        } else {
            throw new Error("String '" + period + "' is not a valid ISO8601 period.");
        }

        if (distributeOverflow) {
            // note: stop at 1 to ignore overflow of years
            for (var i = duration.length - 1; i > 0; i--) {
                if (duration[i] >= overflowLimits[i]) {
                    duration[i-1] = duration[i-1] + Math.floor(duration[i]/overflowLimits[i]);
                    duration[i] = duration[i] % overflowLimits[i];
                }
            }
        }

        return duration;
    };

    var createTimestamp = function(period){
        return new Date().toISOString();
    };

	return {
		getDuration	    : getDuration,
        createTimestamp : createTimestamp
	};

}) ();