var API_1484_11;
var jq191;
SGAME = function(undefined) {
  var deb = function(undefined) {
    var _debugging = false;
    var init = function(debugging) {
      if(debugging === true) {
        _debugging = debugging
      }
    };
    var log = function(msg) {
      if(_debugging && window.console) {
        console.log(msg)
      }
    };
    return{init:init, log:log}
  }();
  var iso8601Parser = function(undefined) {
    var getDuration = function(period) {
      var multiplicators = [31104E3, 2592E3, 604800, 86400, 3600, 60, 1];
      try {
        var durationPerUnit = _parsePeriodString(period)
      }catch(e) {
        return null
      }
      var durationInSeconds = 0;
      for(var i = 0;i < durationPerUnit.length;i++) {
        durationInSeconds += durationPerUnit[i] * multiplicators[i]
      }
      return durationInSeconds
    };
    function _parsePeriodString(period, _distributeOverflow) {
      var distributeOverflow = _distributeOverflow ? _distributeOverflow : false;
      var valueIndexes = [2, 3, 4, 5, 7, 8, 9];
      var duration = [0, 0, 0, 0, 0, 0, 0];
      var overflowLimits = [0, 12, 4, 7, 24, 60, 60];
      var struct;
      period = period.toUpperCase();
      if(!period) {
        return duration
      }else {
        if(typeof period !== "string") {
          throw new Error("Invalid iso8601 period string '" + period + "'");
        }
      }
      if(struct = /^P((\d+Y)?(\d+M)?(\d+W)?(\d+D)?)?(T(\d+H)?(\d+M)?(\d+S)?)?$/.exec(period)) {
        for(var i = 0;i < valueIndexes.length;i++) {
          var structIndex = valueIndexes[i];
          duration[i] = struct[structIndex] ? +struct[structIndex].replace(/[A-Za-z]+/g, "") : 0
        }
      }else {
        throw new Error("String '" + period + "' is not a valid ISO8601 period.");
      }
      if(distributeOverflow) {
        for(var i = duration.length - 1;i > 0;i--) {
          if(duration[i] >= overflowLimits[i]) {
            duration[i - 1] = duration[i - 1] + Math.floor(duration[i] / overflowLimits[i]);
            duration[i] = duration[i] % overflowLimits[i]
          }
        }
      }
      return duration
    }
    return{getDuration:getDuration}
  }();
  var fancybox = function(undefined) {
    var _currentFancybox = undefined;
    var _currentOnCloseCallback = undefined;
    var init = function() {
    };
    var create = function(options, onCloseCallback) {
      _removeCurrentFancybox();
      _currentOnCloseCallback = onCloseCallback;
      API_1484_11 = new Local_API_1484_11({}, jq191);
      var width = 850;
      var height = 650;
      var lo = {};
      var url;
      if(options) {
        if(options.width) {
          width = options.width
        }
        if(options.height) {
          height = options.height
        }
        if(options.lo) {
          lo = options.lo
        }
        if(typeof lo["url"] == "string") {
          url = lo["url"]
        }
      }
      if(typeof url != "string") {
        return
      }
      var fancybox = document.createElement("div");
      fancybox.style.width = width + "px";
      fancybox.style.height = height + "px";
      fancybox.style.overflow = "hidden";
      fancybox.style.background = "white";
      fancybox.style.position = "absolute";
      fancybox.style.top = 0;
      fancybox.style.zindex = 9999;
      fancybox.style.borderRadius = "1em";
      fancybox.style.border = "2px solid black";
      fancybox.setAttribute("id", "test");
      var marginLeft = (window.innerWidth - width) / 2;
      fancybox.style.marginLeft = marginLeft + "px";
      var marginTop = (window.innerHeight - height) / 2;
      fancybox.style.marginTop = marginTop + "px";
      var closeButton = document.createElement("img");
      closeButton.src = "/assets/sgame/close.png";
      closeButton.style.width = "25px";
      closeButton.style.height = "25px";
      closeButton.style.padding = "5px";
      closeButton.style.cursor = "pointer";
      closeButton.style.position = "absolute";
      closeButton.style.right = 0;
      closeButton.onclick = function() {
        closeCurrentFancybox()
      };
      fancybox.appendChild(closeButton);
      var semaphore = document.createElement("img");
      semaphore.id = "semaphore";
      semaphore.src = "/assets/sgame/semaphore/semaphore_red.png";
      semaphore.style.width = "45px";
      semaphore.style.height = "40px";
      semaphore.style.padding = "5px";
      semaphore.style.position = "absolute";
      semaphore.style.left = "0px";
      semaphore.style.top = "0px";
      fancybox.appendChild(semaphore);
      var iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.style.width = "95%";
      iframe.style.height = "95%";
      iframe.style.marginLeft = "2.5%";
      iframe.style.marginTop = "40px";
      iframe.style.overflow = "hidden";
      iframe.style.overflowY = "auto";
      iframe.scrolling = "yes";
      iframe.style.frameBorder = "0";
      iframe.style.borderStyle = "none";
      fancybox.appendChild(iframe);
      _currentFancybox = fancybox;
      document.body.appendChild(fancybox);
      observer.start(iframe, lo, API_1484_11)
    };
    var _removeCurrentFancybox = function() {
      if(typeof _currentFancybox == "undefined") {
        return
      }
      _currentFancybox.style.display = "none";
      _currentFancybox.parentNode.removeChild(_currentFancybox);
      _currentFancybox = undefined;
      API_1484_11 = undefined
    };
    var closeCurrentFancybox = function() {
      _removeCurrentFancybox();
      var report = observer.stop();
      if(typeof _currentOnCloseCallback === "function") {
        _currentOnCloseCallback(report)
      }
      _currentOnCloseCallback = undefined
    };
    return{init:init, create:create, closeCurrentFancybox:closeCurrentFancybox}
  }();
  var observer = function(undefined) {
    var _stopped = true;
    var _current_iframe = undefined;
    var _current_lo = undefined;
    var _SCORM_LMS_API = undefined;
    var startTime;
    var success;
    var scorm_success_status;
    var scorm_scaled_score;
    var scorm_completion_status;
    var scorm_progress_measure;
    var scorm_scaled_score_threshold = 0.8;
    var start = function(iframe, lo, SCORM_LMS_API) {
      if(_stopped === false || typeof _current_iframe != "undefined") {
        return null
      }
      _stopped = false;
      _resetParams();
      _current_iframe = iframe;
      _current_lo = lo;
      _SCORM_LMS_API = SCORM_LMS_API;
      _loadEvents();
      semaphore.changeColor("red");
      if(_current_lo.scorm_type == "asset") {
        var requiredTime = _getRequiredTime(_current_lo);
        deb.log("Required Time: " + requiredTime);
        semaphore.setUpBlink("yellow", requiredTime * 0.5 - 0.5, requiredTime * 0.5);
        semaphore.changeColor("green", requiredTime)
      }
    };
    var _resetParams = function() {
      _current_iframe = undefined;
      _current_lo = undefined;
      _SCORM_LMS_API = undefined;
      startTime = Date.now();
      success = false;
      scorm_success_status = undefined;
      scorm_scaled_score = undefined;
      scorm_completion_status = undefined;
      scorm_progress_measure = undefined
    };
    var _loadEvents = function() {
      if(_current_lo.scorm_type == "sco") {
        _SCORM_LMS_API.addListener("cmi.success_status", function(value) {
          scorm_success_status = value;
          if(scorm_success_status === "passed") {
            if(semaphore.getCurrentColor() != "green") {
              semaphore.stop();
              semaphore.changeColor("green")
            }
          }
        });
        _SCORM_LMS_API.addListener("cmi.score.scaled", function(value) {
          scorm_scaled_score = value;
          if(scorm_scaled_score >= scorm_scaled_score_threshold) {
            if(semaphore.getCurrentColor() != "green") {
              semaphore.stop();
              semaphore.changeColor("green")
            }
          }
        });
        _SCORM_LMS_API.addListener("cmi.completion_status", function(value) {
          scorm_completion_status = value
        });
        _SCORM_LMS_API.addListener("cmi.progress_measure", function(value) {
          scorm_progress_measure = value
        })
      }
    };
    var stop = function() {
      if(_stopped === true || typeof _current_iframe == "undefined") {
        return null
      }
      _stopped = true;
      semaphore.stop();
      var time_spent = Math.round((Date.now() - startTime) / 1E3);
      success = semaphore.getCurrentColor() === "green";
      var report = {lo_metadata:_current_lo, time:time_spent, success:success};
      if(typeof scorm_success_status != "undefined") {
        report["scorm_success_status"] = scorm_success_status
      }
      if(typeof scorm_scaled_score != "undefined") {
        report["scorm_scaled_score"] = scorm_scaled_score
      }
      if(typeof scorm_completion_status != "undefined") {
        report["scorm_completion_status"] = scorm_completion_status
      }
      if(typeof scorm_progress_measure != "undefined") {
        report["scorm_progress_measure"] = scorm_progress_measure
      }
      _resetParams();
      return report
    };
    var isStopped = function() {
      return _stopped
    };
    var _getTypicalLearningTime = function(metadata) {
      if(metadata.educational) {
        if(metadata.educational.typicalLearningTime) {
          if(metadata.educational.typicalLearningTime.duration) {
            if(metadata.educational.typicalLearningTime.duration.langstrings) {
              if(metadata.educational.typicalLearningTime.duration.langstrings["x-none"]) {
                var TLT = metadata.educational.typicalLearningTime.duration.langstrings["x-none"];
                var parsedTLT = iso8601Parser.getDuration(TLT);
                if(parsedTLT) {
                  return parsedTLT
                }
              }
            }
          }
        }
      }
      return null
    };
    var _getRequiredTime = function(lo) {
      var defaultTime = 15;
      var maximumTime = 60;
      var alfa = 0.5;
      var TLT = _getTypicalLearningTime(lo["lom_metadata"]);
      if(!TLT) {
        return defaultTime
      }
      return Math.min(alfa * TLT, maximumTime)
    };
    return{start:start, stop:stop, isStopped:isStopped}
  }();
  var semaphore = function(undefined) {
    var current_color;
    var changeColorTimer;
    var startBlinkTimer;
    var blinkTimer;
    var stopBlinkTimer;
    var getCurrentColor = function() {
      return current_color
    };
    var changeColor = function(color, delay) {
      if(delay) {
        changeColorTimer = setTimeout(function() {
          _changeColor(color)
        }, delay * 1E3)
      }else {
        _changeColor(color)
      }
    };
    var _changeColor = function(color) {
      var semaphore = document.getElementById("semaphore");
      if(semaphore) {
        current_color = color;
        semaphore.src = _getImageForColor(color)
      }
    };
    var _getImageForColor = function(color) {
      switch(color) {
        case "green":
          return"/assets/sgame/semaphore/semaphore_green.png";
          break;
        case "yellow":
          return"/assets/sgame/semaphore/semaphore_yellow.png";
          break;
        case "red":
          return"/assets/sgame/semaphore/semaphore_red.png";
          break;
        default:
          return"/assets/sgame/semaphore/semaphore.png";
          break
      }
    };
    var setUpBlink = function(color, duration, delay) {
      if(delay) {
        startBlinkTimer = setTimeout(function() {
          _blink(color, duration)
        }, delay * 1E3)
      }else {
        _blink(color, duration)
      }
    };
    var _blink = function(color, duration) {
      var semaphore = document.getElementById("semaphore");
      if(!semaphore) {
        return
      }
      var coin = false;
      blinkTimer = setInterval(function() {
        if(!semaphore) {
          return
        }
        if(coin) {
          semaphore.src = _getImageForColor(null);
          coin = false
        }else {
          semaphore.src = _getImageForColor(color);
          coin = true
        }
      }, 500);
      stopBlinkTimer = setTimeout(function() {
        clearTimeout(blinkTimer)
      }, duration * 1E3)
    };
    var stop = function() {
      if(changeColorTimer) {
        clearTimeout(changeColorTimer)
      }
      if(startBlinkTimer) {
        clearTimeout(startBlinkTimer)
      }
      if(blinkTimer) {
        clearTimeout(blinkTimer)
      }
      if(stopBlinkTimer) {
        clearTimeout(stopBlinkTimer)
      }
    };
    return{getCurrentColor:getCurrentColor, changeColor:changeColor, setUpBlink:setUpBlink, stop:stop}
  }();
  deb.init(true);
  var _settings = {};
  var _los = {};
  var _all_mapped_los = [];
  var _event_mapping = {};
  var _togglePauseFunction = undefined;
  var init = function(options) {
    deb.log("SGAME init with options ");
    deb.log(options);
    if(options) {
      if(typeof options.togglePause === "function") {
        _togglePauseFunction = options.togglePause
      }
    }
  };
  var loadSettings = function(settings) {
    deb.log("SGAME load settings ");
    deb.log(settings);
    _loadScript("http://code.jquery.com/jquery-1.9.1.js", function() {
      $.noConflict();
      jq191 = jQuery.noConflict(true)
    });
    _settings = settings;
    _los = {};
    _all_mapped_los = [];
    _event_mapping = {};
    if(settings.lo_list) {
      for(var i = 0;i < settings.lo_list.length;i++) {
        if(typeof settings.lo_list[i].id != "undefined") {
          _los[settings.lo_list[i].id] = settings.lo_list[i];
          _all_mapped_los.push({"id":settings.lo_list[i].id, "marked":false})
        }
      }
    }
    if(settings.event_mapping) {
      for(var i = 0;i < settings.event_mapping.length;i++) {
        var eMapping = settings.event_mapping[i];
        _event_mapping[eMapping.event_id] = {};
        _event_mapping[eMapping.event_id].los = [];
        for(var j = 0;j < eMapping.los_id.length;j++) {
          _event_mapping[eMapping.event_id].los.push({id:eMapping.los_id[j], marked:false})
        }
      }
    }
  };
  var triggerLO = function(event_id, callback) {
    var los_candidate = _event_mapping[event_id].los;
    if(los_candidate) {
      if(_containWildcard(los_candidate)) {
        var rRobinResult = _roundRobinChoice(_all_mapped_los);
        _all_mapped_los = rRobinResult.los
      }else {
        var rRobinResult = _roundRobinChoice(los_candidate);
        _event_mapping[event_id].los = rRobinResult.los
      }
      showLO(_los[rRobinResult.lo.id], callback)
    }
  };
  var _containWildcard = function(los_array) {
    for(var i = 0;i < los_array.length;i++) {
      if(los_array[i].id === "*") {
        return true
      }
    }
    return false
  };
  var showLO = function(lo, callback) {
    if(typeof lo != "object" || typeof lo["url"] != "string") {
      if(typeof callback == "function") {
        callback(null, null)
      }
      return
    }
    _togglePause();
    fancybox.create({lo:lo}, function(report) {
      deb.log("LO report");
      deb.log(report);
      if(typeof callback == "function") {
        callback(report.success, report)
      }
      _togglePause()
    })
  };
  var showRandomLO = function(callback) {
    _requestLOMetadata(undefined, function(metadata) {
      showLO(metadata, callback)
    }, function() {
      if(typeof callback == "function") {
        callback(null, null)
      }
    })
  };
  var closeLO = function() {
    fancybox.closeCurrentFancybox()
  };
  var _requestLOMetadata = function(loId, successCallback, failCallback) {
    var serverAPIurl;
    if(typeof loId == "undefined") {
      serverAPIurl = "/lo/random/metadata.json"
    }else {
      serverAPIurl = "/lo/" + loId + "/metadata.json"
    }
    try {
      _XMLHttprequest(serverAPIurl, function(data) {
        successCallback(data)
      })
    }catch(e) {
      failCallback(e)
    }
  };
  var _XMLHttprequest = function(url, callback) {
    var xmlHttp = new XMLHttpRequest;
    xmlHttp.onreadystatechange = function() {
      if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        var data = JSON.parse(xmlHttp.responseText);
        callback(data)
      }
    };
    xmlHttp.open("GET", url, true);
    xmlHttp.send("")
  };
  var _roundRobinChoice = function(los) {
    var selectedLO;
    var candidate_los = [];
    for(var i = 0;i < los.length;i++) {
      if(los[i].marked === false) {
        candidate_los.push(los[i])
      }
    }
    if(candidate_los.length > 0) {
      selectedLO = _randomChoice(candidate_los)
    }else {
      for(var i = 0;i < los.length;i++) {
        los[i].marked = false
      }
      selectedLO = _randomChoice(los)
    }
    los[los.indexOf(selectedLO)].marked = true;
    return{lo:selectedLO, los:los}
  };
  var _randomChoice = function(box) {
    if(typeof box == "number") {
      return box
    }else {
      return box[_generateRandomNumber(0, box.length - 1)]
    }
  };
  var _generateRandomNumber = function(a, b) {
    if(typeof a != "number" || typeof b != "number") {
      throw{name:"Invalid number format exception"};
    }
    return Math.round(a + Math.random() * (b - a))
  };
  var _togglePause = function() {
    if(typeof _togglePauseFunction === "function") {
      _togglePauseFunction()
    }
  };
  var _loadScript = function(scriptSrc, callback) {
    if(typeof scriptSrc !== "string" || typeof callback !== "function") {
      return
    }
    var head = document.getElementsByTagName("head")[0];
    if(head) {
      var script = document.createElement("script");
      script.setAttribute("src", scriptSrc);
      script.setAttribute("type", "text/javascript");
      var loadFunction = function() {
        if(this.readyState == "complete" || this.readyState == "loaded") {
          callback()
        }
      };
      script.onreadystatechange = loadFunction;
      script.onload = callback;
      head.appendChild(script)
    }
  };
  return{init:init, loadSettings:loadSettings, triggerLO:triggerLO, showLO:showLO, showRandomLO:showRandomLO, closeLO:closeLO}
}();
SGAME.VERSION = "0.2";
SGAME.AUTHORS = "Aldo Gordillo, Enrique Barra";
SGAME.URL = "http://github.com/agordillo/sgame";
SGAME.EVENT = {};
SGAME.EVENT.GENERIC = "generic";
SGAME.EVENT.EXTRA_LIFE = "extra_life";
SGAME.EVENT.EXTRA_SKILL = "extra_skill";
SGAME.EVENT.EXTRA_ITEM = "extra_item";
SGAME.EVENT.BLOCKER = "blocker";
SGAME.EVENT.CHEAT = "cheat";
SGAME.EVENT.CONTINUE = "continue";
function Local_API_1484_11(options, jQuery) {
  if(jQuery) {
    var $ = jQuery
  }
  "use strict";
  var defaults = {version:"2.3", moddate:"20/04/2016 7:10PM", createdate:"07/17/2010 08:15AM", prefix:"Local_API_1484_11", errorCode:0, diagnostic:"", initialized:0, terminated:0, debug:true, listeners:{}, CMI:{_version:"Local 1.0", comments_from_learner:{_children:"comment,location,timestamp", _count:"0"}, comments_from_lms:{_children:"comment,location,timestamp", _count:"0"}, completion_status:"unknown", completion_threshold:"0.7", credit:"no-credit", entry:"ab-initio", exit:"", interactions:{_children:"id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description", 
  _count:"0"}, launch_data:"?name1=value1&name2=value2&name3=value3", learner_id:"100", learner_name:"Simulated User", learner_preference:{_children:"audio_level,language,delivery_speed,audio_captioning", audio_level:"1", language:"", delivery_speed:"1", audio_captioning:"0"}, location:"", max_time_allowed:"", mode:"normal", objectives:{_children:"id,score,success_status,completion_status,description", _count:"0"}, progress_measure:"", scaled_passing_score:"0.7", score:{_children:"scaled,raw,min,max", 
  scaled:"", raw:"", min:"", max:""}, session_time:"PT0H0M0S", success_status:"unknown", suspend_data:"", time_limit_action:"", total_time:"PT0H0M0S"}}, settings = $.extend(defaults, options), cmi = {}, completion_status = "|completed|incomplete|not attempted|unknown|", success_status = "|passed|failed|unknown|", read_only = "|_version|completion_threshold|credit|entry|launch_data|learner_id|learner_name|_children|_count|mode|maximum_time_allowed|scaled_passing_score|time_limit_action|total_time|comment|", 
  write_only = "|exit|session_time|", exit = "|time-out|suspend|logout|normal||", errors = {0:"No error", 101:"General exception", 102:"General Initialization Failure", 103:"Already Initialized", 104:"Content Instance Terminated", 111:"General Termination Failure", 112:"Termination Before Initialization", 113:"Termination After Termination", 122:"Retrieve Data Before Initialization", 123:"Retrieve Data After Termination", 132:"Store Data Before Initialization", 133:"Store Data After Termination", 
  142:"Commit Before Initialization", 143:"Commit After Termination", 201:"General Argument Error", 301:"General Get Failure", 351:"General Set Failure", 391:"General Commit Failure", 401:"Undefined Data Model", 402:"Unimplemented Data Model Element", 403:"Data Model Element Value Not Initialized", 404:"Data Model Element Is Read Only", 405:"Data Model Element Is Write Only", 406:"Data Model Element Type Mismatch", 407:"Data Model Element Value Out Of Range", 408:"Data Model Dependency Not Established"}, 
  self = this;
  function throwVocabError(k, v) {
    settings.diganostic = "The " + k + " of " + v + " must be a proper vocabulary element.";
    settings.errorCode = 406;
    return"false"
  }
  function throwUnimplemented(key) {
    settings.errorCode = 402;
    settings.diagnostic = "The value for key " + key + " has not been created yet.";
    return"false"
  }
  function throwArgumentError(key, argument) {
    settings.errorCode = 201;
    settings.diagnostic = "The value for key " + key + " is not valid.";
    return"false"
  }
  function throwGeneralSetError(k, v, o) {
    settings.errorCode = "351";
    settings.diagnostic = "The " + k + " element must be unique.  The value '" + v + "' has already been set in #" + o;
    return"false"
  }
  function setData(key, val, obj) {
    var ka = key.split(/\./);
    if(ka.length < 2) {
      obj[ka[0]] = val
    }else {
      if(!obj[ka[0]]) {
        obj[ka[0]] = {}
      }
      obj = obj[ka.shift()];
      setData(ka.join("."), val, obj)
    }
  }
  function getData(key, obj) {
    var ka = key.split(/\./), v;
    if(ka.length < 2) {
      try {
        return obj[ka[0]]
      }catch(e) {
        throwUnimplemented(key);
        return"false"
      }
    }else {
      v = ka.shift();
      if(obj[v]) {
        return String(getData(ka.join("."), obj[v]))
      }
      throwUnimplemented(key);
      return"false"
    }
  }
  function cmiGetValue(key) {
    var r = "false";
    switch(key) {
      case "cmi.exit":
      ;
      case "cmi.session_time":
        settings.errorCode = 405;
        settings.diagnostic = "Sorry, this has been specified as a read-only value for " + key;
        break;
      case "cmi.learner_name":
        r = settings.CMI.learner_name;
        break;
      default:
        r = getData(key.substr(4, key.length), cmi);
        if(r === "undefined") {
          settings.errorCode = 401;
          settings.diagnostic = "Sorry, there was a undefined response from " + key;
          r = "false"
        }
        debug(settings.prefix + ": GetValue " + key + " = " + r, 4);
        break
    }
    return r
  }
  function isReadOnly(key) {
    var tiers = key.split("."), v = tiers[tiers.length - 1];
    if(tiers[0] === "adl" && tiers[4] === "id") {
      return true
    }
    if(tiers[1] === "comments_from_lms") {
      return true
    }
    if(tiers[1] === "comments_from_learner") {
      return false
    }
    return read_only.indexOf("|" + v + "|") >= 0
  }
  function isWriteOnly(key) {
    var tiers = key.split("."), v = tiers[tiers.length - 1];
    return write_only.indexOf("|" + v + "|") >= 0
  }
  function roundVal(v) {
    var dec = 2;
    return Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)
  }
  function getObjLength(obj) {
    var name, length = 0;
    for(name in obj) {
      if(obj.hasOwnProperty(name)) {
        length += 1
      }
    }
    return length
  }
  function checkExitType() {
    if(cmi.exit === "suspend") {
      cmi.entry = "resume"
    }
  }
  function suspendDataUsageStatistic() {
    return roundVal(cmi.suspend_data.length / 64E3 * 100) + "%"
  }
  function debug(msg, lvl) {
    if(settings.debug) {
      if(!window.console) {
        window.console = {};
        window.console.info = noconsole;
        window.console.log = noconsole;
        window.console.warn = noconsole;
        window.console.error = noconsole;
        window.console.trace = noconsole
      }
      switch(lvl) {
        case 1:
          console.error(msg);
          break;
        case 2:
          console.warn(msg);
          break;
        case 4:
          console.info(msg);
          break;
        case 3:
          console.log(msg);
          break;
        default:
          console.log(msg);
          return false
      }
      return true
    }
    if(lvl < 3 && settings.throw_alerts) {
      alert(msg)
    }
    return false
  }
  function callListener(name, params) {
    if(typeof settings.listeners[name] == "function") {
      if(typeof params != "undefined") {
        settings.listeners[name](params)
      }
    }
  }
  this.isRunning = function() {
    return settings.initialized === 1 && settings.terminated === 0
  };
  this.Initialize = function() {
    debug(settings.prefix + ":  Initializing...", 3);
    if(settings.cmi) {
      cmi = settings.cmi;
      checkExitType()
    }else {
      cmi = settings.CMI
    }
    settings.initialized = 1;
    settings.terminated = 0;
    return"true"
  };
  this.GetValue = function(key) {
    settings.errorCode = 0;
    var r = "false", k = key.toString(), tiers = [];
    if(this.isRunning()) {
      if(isWriteOnly(k)) {
        debug(settings.prefix + ": This " + k + " is write only", 4);
        settings.errorCode = 405;
        return"false"
      }
      tiers = k.toLowerCase().split(".");
      switch(tiers[0]) {
        case "cmi":
          r = cmiGetValue(k);
          break;
        case "ssp":
          break;
        case "adl":
          break
      }
      return r
    }
    settings.errorCode = 123;
    return r
  };
  this.SetValue = function(key, value) {
    debug(settings.prefix + ": SetValue: " + key + " = " + value, 4);
    settings.errorCode = 0;
    var tiers = [], k = key.toString(), v = value.toString(), z = 0, count = 0, arr = [];
    if(this.isRunning()) {
      if(isReadOnly(k)) {
        debug(settings.prefix + ": This " + k + " is read only", 4);
        settings.errorCode = 404;
        return"false"
      }
      tiers = k.split(".");
      switch(tiers[0]) {
        case "cmi":
          switch(key) {
            case "cmi.location":
              if(v.length > 1E3) {
                debug(settings.prefix + ": Some LMS's might truncate your bookmark as you've passed " + v.length + " characters of bookmarking data", 2)
              }
              break;
            case "cmi.progress_measure":
              var scaledProgressMeasure = parseFloat(v);
              if(typeof scaledProgressMeasure == "number" && !isNaN(scaledProgressMeasure)) {
                scaledProgressMeasure = Math.max(0, Math.min(1, scaledProgressMeasure));
                callListener(key, scaledProgressMeasure)
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.completion_status":
              if(completion_status.indexOf("|" + v + "|") === -1) {
                return throwVocabError(key, v)
              }
              callListener(key, v);
              break;
            case "cmi.exit":
              if(exit.indexOf("|" + v + "|") === -1) {
                return throwVocabError(key, v)
              }
              break;
            case "cmi.score.scaled":
              var scaledScore = parseFloat(v);
              if(typeof scaledScore == "number" && !isNaN(scaledScore)) {
                scaledScore = Math.max(0, Math.min(1, scaledScore));
                callListener(key, scaledScore)
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.score.min":
              var scoreMin = parseFloat(v);
              if(typeof scoreMin == "number" && !isNaN(scoreMin)) {
                settings.CMI.score.min = scoreMin
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.score.max":
              var scoreMax = parseFloat(v);
              if(typeof scoreMax == "number" && !isNaN(scoreMax)) {
                settings.CMI.score.max = scoreMax
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.score.raw":
              var rawScore = parseFloat(v);
              if(typeof rawScore == "number" && !isNaN(rawScore)) {
                var maxScore = parseFloat(settings.CMI.score.max);
                maxScore = typeof maxScore == "number" && !isNaN(maxScore) ? maxScore : 100;
                var minScore = parseFloat(settings.CMI.score.min);
                minScore = typeof minScore == "number" && !isNaN(minScore) ? minScore : 0;
                var diff = maxScore - minScore;
                if(diff <= 0) {
                  diff = 100
                }
                var scaledScore = Math.max(0, Math.min(1, (rawScore - minScore) / diff));
                callListener("cmi.score.scaled", scaledScore)
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.success_status":
              if(success_status.indexOf("|" + v + "|") === -1) {
                return throwVocabError(key, v)
              }
              callListener(key, v);
              break;
            default:
              switch(tiers[1]) {
                case "comments_from_lms":
                  settings.errorCode = "404";
                  settings.diagnostic = "The cmi.comments_from_lms element is entirely read only.";
                  return"false";
                case "comments_from_learner":
                  if(cmi.comments_from_learner._children.indexOf(tiers[3]) === -1) {
                    return throwVocabError(key, v)
                  }
                  setData(k.substr(4, k.length), v, cmi);
                  cmi.comments_from_learner._count = (getObjLength(cmi.comments_from_learner) - 2).toString();
                  return"true";
                case "interactions":
                  if(cmi.interactions._children.indexOf(tiers[3]) === -1) {
                    return throwVocabError(key, v)
                  }
                  cmi.interactions._count = (getObjLength(cmi.interactions) - 2).toString();
                  if(isNaN(parseInt(tiers[2], 10))) {
                    return"false"
                  }
                  if(!$.isPlainObject(cmi.interactions[tiers[2]])) {
                    if(tiers[3] === "id") {
                      cmi.interactions[tiers[2]] = {};
                      setData(k.substr(4, k.length), v, cmi);
                      cmi.interactions._count = (getObjLength(cmi.interactions) - 2).toString();
                      if(!$.isPlainObject(cmi.interactions[tiers[2]].objectives)) {
                        debug(settings.prefix + ": Constructing objectives object for new interaction", 4);
                        cmi.interactions[tiers[2]].objectives = {};
                        cmi.interactions[tiers[2]].objectives._count = "-1"
                      }
                      if(!$.isPlainObject(cmi.interactions[tiers[2]].correct_responses)) {
                        debug(settings.prefix + ": Constructing correct responses object for new interaction", 4);
                        cmi.interactions[tiers[2]].correct_responses = {};
                        cmi.interactions[tiers[2]].correct_responses._count = "-1"
                      }
                      return"true"
                    }
                    debug("Can't add interaction without ID first!", 3);
                    return"false"
                  }
                  if(tiers[3] === "objectives") {
                    if(tiers[5] === "id") {
                      count = parseInt(cmi.interactions[tiers[2]].objectives._count, 10);
                      for(z = 0;z < count;z += 1) {
                        if(cmi.interactions[tiers[2]].objectives[z].id === v) {
                          return throwGeneralSetError(key, v, z)
                        }
                      }
                    }else {
                      return throwVocabError(key, v)
                    }
                    setData(k.substr(4, k.length), v, cmi);
                    cmi.interactions[tiers[2]].objectives._count = (getObjLength(cmi.interactions[tiers[2]].objectives) - 1).toString();
                    return"true"
                  }
                  if(tiers[3] === "correct_responses") {
                    setData(k.substr(4, k.length), v, cmi);
                    cmi.interactions[tiers[2]].correct_responses._count = (getObjLength(cmi.interactions[tiers[2]].correct_responses) - 1).toString()
                  }
                  setData(k.substr(4, k.length), v, cmi);
                  cmi.interactions._count = (getObjLength(cmi.interactions) - 2).toString();
                  return"true";
                case "objectives":
                  if(tiers[3] === "id") {
                    count = parseInt(cmi.objectives._count, 10);
                    for(z = 0;z < count;z += 1) {
                      if(cmi.objectives[z].id === v) {
                        settings.errorCode = "351";
                        settings.diagnostic = "The objectives.id element must be unique.  The value '" + v + "' has already been set in objective #" + z;
                        return"false"
                      }
                    }
                  }
                  if(tiers[3] !== "id") {
                    arr = parseInt(tiers[2], 10);
                    if(cmi.objectives[arr] === undefined) {
                      settings.errorCode = "408";
                      settings.diagnostic = "The objectives.id element must be set before other elements can be set";
                      return"false"
                    }
                  }
                  if(isNaN(parseInt(tiers[2], 10))) {
                    return"false"
                  }
                  setData(k.substr(4, k.length), v, cmi);
                  cmi.objectives._count = (getObjLength(cmi.objectives) - 2).toString();
                  return"true"
              }
              break
          }
          setData(k.substr(4, k.length), v, cmi);
          break;
        case "ssp":
          break;
        case "adl":
          break
      }
      return"true"
    }
    if(settings.terminated) {
      settings.errorCode = 133
    }else {
      settings.errorCode = 132
    }
    return"false"
  };
  this.Commit = function() {
    debug(settings.prefix + ": Commit CMI Object:", 4);
    debug(cmi);
    debug(settings.prefix + ": Suspend Data Usage " + suspendDataUsageStatistic());
    $(self).triggerHandler({type:"StoreData", runtimedata:cmi});
    return"true"
  };
  this.Terminate = function() {
    self.Commit();
    settings.terminated = 1;
    settings.initialized = 0;
    return"true"
  };
  this.GetErrorString = function(param) {
    if(param !== "") {
      var nparam = parseInt(param, 10);
      if(errors[nparam] !== undefined) {
        return errors[nparam]
      }
    }
    return""
  };
  this.GetLastError = function() {
    return settings.errorCode
  };
  this.GetDiagnostic = function() {
    return settings.diagnostic
  };
  this.addListener = function(event, listener) {
    if(typeof event == "string" && typeof listener == "function") {
      settings.listeners[event] = listener
    }
  };
  this.setCMILMSValue = function(name, value) {
    if(typeof name == "string") {
      settings.CMI[name] = value
    }
  }
}
function Local_API_SCORM_12(options) {
  var defaults = {version:"1.0", moddate:"20/04/2016 7:10PM", createdate:"20/04/2016 7:10PM", prefix:"Local_API_SCORM_12", errorCode:0, diagnostic:"", initialized:0, terminated:0, debug:true, listeners:{}, CMI:{_version:"Local 1.0", comments_from_learner:{_children:"comment,location,timestamp", _count:"0"}, comments_from_lms:{_children:"comment,location,timestamp", _count:"0"}, lesson_status:"unknown", completion_threshold:"0.7", credit:"no-credit", entry:"ab-initio", exit:"", interactions:{_children:"id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description", 
  _count:"0"}, launch_data:"?name1=value1&name2=value2&name3=value3", learner_id:"100", learner_name:"Simulated User", learner_preference:{_children:"audio_level,language,delivery_speed,audio_captioning", audio_level:"1", language:"", delivery_speed:"1", audio_captioning:"0"}, location:"", lesson_location:"", max_time_allowed:"", mode:"normal", objectives:{_children:"id,score,lesson_status,description", _count:"0"}, progress_measure:"", scaled_passing_score:"0.7", score:{_children:"scaled,raw,min,max", 
  scaled:"", raw:"", min:"", max:""}, session_time:"PT0H0M0S", suspend_data:"", time_limit_action:"", total_time:"PT0H0M0S"}}, settings = $.extend(defaults, options), cmi = {}, lesson_status = "|passed|completed|failed|incomplete|browsed|not attempted|unknown|", read_only = "|_version|completion_threshold|credit|entry|launch_data|learner_id|learner_name|_children|_count|mode|maximum_time_allowed|scaled_passing_score|time_limit_action|total_time|comment|", write_only = "|exit|session_time|", exit = 
  "|time-out|suspend|logout|normal||", errors = {0:"No error", 101:"General exception", 102:"General Initialization Failure", 103:"Already Initialized", 104:"Content Instance Terminated", 111:"General Termination Failure", 112:"Termination Before Initialization", 113:"Termination After Termination", 122:"Retrieve Data Before Initialization", 123:"Retrieve Data After Termination", 132:"Store Data Before Initialization", 133:"Store Data After Termination", 142:"Commit Before Initialization", 143:"Commit After Termination", 
  201:"General Argument Error", 301:"General Get Failure", 351:"General Set Failure", 391:"General Commit Failure", 401:"Undefined Data Model", 402:"Unimplemented Data Model Element", 403:"Data Model Element Value Not Initialized", 404:"Data Model Element Is Read Only", 405:"Data Model Element Is Write Only", 406:"Data Model Element Type Mismatch", 407:"Data Model Element Value Out Of Range", 408:"Data Model Dependency Not Established"}, self = this;
  function throwVocabError(k, v) {
    settings.diganostic = "The " + k + " of " + v + " must be a proper vocabulary element.";
    settings.errorCode = 406;
    return"false"
  }
  function throwUnimplemented(key) {
    settings.errorCode = 402;
    settings.diagnostic = "The value for key " + key + " has not been created yet.";
    return"false"
  }
  function throwArgumentError(key, argument) {
    settings.errorCode = 201;
    settings.diagnostic = "The value for key " + key + " is not valid.";
    return"false"
  }
  function throwGeneralSetError(k, v, o) {
    settings.errorCode = "351";
    settings.diagnostic = "The " + k + " element must be unique.  The value '" + v + "' has already been set in #" + o;
    return"false"
  }
  function setData(key, val, obj) {
    var ka = key.split(/\./);
    if(ka.length < 2) {
      obj[ka[0]] = val
    }else {
      if(!obj[ka[0]]) {
        obj[ka[0]] = {}
      }
      obj = obj[ka.shift()];
      setData(ka.join("."), val, obj)
    }
  }
  function getData(key, obj) {
    var ka = key.split(/\./), v;
    if(ka.length < 2) {
      try {
        return obj[ka[0]]
      }catch(e) {
        throwUnimplemented(key);
        return"false"
      }
    }else {
      v = ka.shift();
      if(obj[v]) {
        return String(getData(ka.join("."), obj[v]))
      }
      throwUnimplemented(key);
      return"false"
    }
  }
  function cmiGetValue(key) {
    var r = "false";
    switch(key) {
      case "cmi.core.exit":
      ;
      case "cmi.core.session_time":
        settings.errorCode = 405;
        settings.diagnostic = "Sorry, this has been specified as a read-only value for " + key;
        break;
      case "cmi.core.student_name":
        r = settings.CMI.learner_name;
        break;
      default:
        key = key.replace("cmi.core.", "").replace("cmi.", "");
        r = getData(key, cmi);
        if(r === "undefined") {
          settings.errorCode = 401;
          settings.diagnostic = "Sorry, there was a undefined response from " + key;
          r = "false"
        }
        break
    }
    return r
  }
  function isReadOnly(key) {
    var tiers = key.split("."), v = tiers[tiers.length - 1];
    if(tiers[0] === "adl" && tiers[4] === "id") {
      return true
    }
    if(tiers[1] === "comments_from_lms") {
      return true
    }
    return read_only.indexOf("|" + v + "|") >= 0
  }
  function isWriteOnly(key) {
    var tiers = key.split("."), v = tiers[tiers.length - 1];
    return write_only.indexOf("|" + v + "|") >= 0
  }
  function roundVal(v) {
    var dec = 2;
    return Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)
  }
  function getObjLength(obj) {
    var name, length = 0;
    for(name in obj) {
      if(obj.hasOwnProperty(name)) {
        length += 1
      }
    }
    return length
  }
  function checkExitType() {
    if(cmi.core.exit === "suspend") {
      cmi.core.entry = "resume"
    }
  }
  function suspendDataUsageStatistic() {
    return roundVal(cmi.suspend_data.length / 64E3 * 100) + "%"
  }
  function debug(msg, lvl) {
    if(settings.debug) {
      if(!window.console) {
        window.console = {};
        window.console.info = noconsole;
        window.console.log = noconsole;
        window.console.warn = noconsole;
        window.console.error = noconsole;
        window.console.trace = noconsole
      }
      switch(lvl) {
        case 1:
          console.error(msg);
          break;
        case 2:
          console.warn(msg);
          break;
        case 4:
          console.info(msg);
          break;
        case 3:
          console.log(msg);
          break;
        default:
          console.log(msg);
          return false
      }
      return true
    }
    if(lvl < 3 && settings.throw_alerts) {
      alert(msg)
    }
    return false
  }
  function callListener(name, params) {
    if(typeof settings.listeners[name] == "function") {
      if(typeof params != "undefined") {
        settings.listeners[name](params)
      }
    }
  }
  this.isRunning = function() {
    return settings.initialized === 1 && settings.terminated === 0
  };
  this.LMSInitialize = function() {
    debug(settings.prefix + ":  Initializing...", 3);
    if(settings.cmi) {
      cmi = settings.cmi;
      checkExitType()
    }else {
      cmi = settings.CMI
    }
    settings.initialized = 1;
    settings.terminated = 0;
    return"true"
  };
  this.LMSGetValue = function(key) {
    settings.errorCode = 0;
    var r = "false", k = key.toString(), tiers = [];
    if(this.isRunning()) {
      if(isWriteOnly(k)) {
        settings.errorCode = 405;
        return"false"
      }
      tiers = k.toLowerCase().split(".");
      switch(tiers[0]) {
        case "cmi":
          r = cmiGetValue(k);
          break;
        case "ssp":
          break;
        case "adl":
          break
      }
      return r
    }
    settings.errorCode = 123;
    return r
  };
  this.LMSSetValue = function(key, value) {
    debug(settings.prefix + ": SetValue: " + key + " = " + value, 4);
    settings.errorCode = 0;
    var tiers = [], k = key.toString(), v = value.toString(), z = 0, count = 0, arr = [];
    if(this.isRunning()) {
      if(isReadOnly(k)) {
        settings.errorCode = 404;
        return"false"
      }
      tiers = k.split(".");
      switch(tiers[0]) {
        case "cmi":
          switch(key) {
            case "cmi.core.lesson_location":
              if(v.length > 1E3) {
                debug(settings.prefix + ": Some LMS's might truncate your bookmark as you've passed " + v.length + " characters of bookmarking data", 2)
              }
              break;
            case "cmi.core.lesson_status":
              if(lesson_status.indexOf("|" + v + "|") === -1) {
                return throwVocabError(key, v)
              }
              callListener(key, v);
              break;
            case "cmi.core.exit":
              if(exit.indexOf("|" + v + "|") === -1) {
                return throwVocabError(key, v)
              }
              break;
            case "cmi.core.score.min":
              var scoreMin = parseFloat(v);
              if(typeof scoreMin == "number" && !isNaN(scoreMin)) {
                settings.CMI.score.min = scoreMin
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.core.score.max":
              var scoreMax = parseFloat(v);
              if(typeof scoreMax == "number" && !isNaN(scoreMax)) {
                settings.CMI.score.max = scoreMax
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.core.score.raw":
              var rawScore = parseFloat(v);
              if(typeof rawScore == "number" && !isNaN(rawScore)) {
                var maxScore = parseFloat(settings.CMI.score.max);
                maxScore = typeof maxScore == "number" && !isNaN(maxScore) ? maxScore : 100;
                var minScore = parseFloat(settings.CMI.score.min);
                minScore = typeof minScore == "number" && !isNaN(minScore) ? minScore : 0;
                var diff = maxScore - minScore;
                if(diff <= 0) {
                  diff = 100
                }
                var scaledScore = Math.max(0, Math.min(1, (rawScore - minScore) / diff));
                callListener("cmi.score.scaled", scaledScore)
              }else {
                return throwArgumentError(key, v)
              }
              break;
            default:
              break
          }
          k = k.replace("cmi.core.", "").replace("cmi.", "");
          setData(k, v, cmi);
          break
      }
      return"true"
    }
    if(settings.terminated) {
      settings.errorCode = 133
    }else {
      settings.errorCode = 132
    }
    return"false"
  };
  this.LMSCommit = function() {
    $(self).triggerHandler({type:"StoreData", runtimedata:cmi});
    return"true"
  };
  this.LMSTerminate = function() {
    self.LMSCommit();
    settings.terminated = 1;
    settings.initialized = 0;
    return"true"
  };
  this.LMSFinish = function() {
    self.LMSCommit();
    settings.terminated = 1;
    settings.initialized = 0;
    return"true"
  };
  this.LMSGetErrorString = function(param) {
    if(param !== "") {
      var nparam = parseInt(param, 10);
      if(errors[nparam] !== undefined) {
        return errors[nparam]
      }
    }
    return""
  };
  this.LMSGetLastError = function() {
    return settings.errorCode
  };
  this.LMSGetDiagnostic = function() {
    return settings.diagnostic
  };
  this.addListener = function(event, listener) {
    if(typeof event == "string" && typeof listener == "function") {
      settings.listeners[event] = listener
    }
  };
  this.setCMILMSValue = function(name, value) {
    if(typeof name == "string") {
      settings.CMI[name] = value
    }
  }
}
;
