iso8601Parser = function(undefined) {
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
function Local_API_1484_11(options) {
  var defaults = {version:"2.4", prefix:"Local_API_1484_11", errorCode:0, diagnostic:"", initialized:0, terminated:0, debug:true, listeners:{}, CMI:{_version:"1.0", comments_from_learner:{_children:"comment,location,timestamp", _count:"0"}, comments_from_lms:{_children:"comment,location,timestamp", _count:"0"}, completion_status:"unknown", completion_threshold:"0.7", credit:"credit", entry:"ab-initio", exit:"", interactions:{_children:"id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description", 
  _count:"0"}, launch_data:"", learner_id:"100", learner_name:"Simulated User", learner_preference:{_children:"audio_level,language,delivery_speed,audio_captioning", audio_level:"1", language:"", delivery_speed:"1", audio_captioning:"0"}, location:"", max_time_allowed:"", mode:"normal", objectives:{_children:"id,score,success_status,completion_status,description", _count:"0"}, progress_measure:"", scaled_passing_score:"0.5", score:{_children:"scaled,raw,min,max", scaled:"", raw:"", min:"", max:""}, 
  session_time:"PT0H0M0S", success_status:"unknown", suspend_data:"", time_limit_action:"", total_time:"PT0H0M0S"}}, settings = deepMergeHash(defaults, options), cmi = {}, completion_status = "|completed|incomplete|not attempted|unknown|", success_status = "|passed|failed|unknown|", read_only = "|_version|completion_threshold|credit|entry|launch_data|learner_id|learner_name|_children|_count|mode|maximum_time_allowed|scaled_passing_score|time_limit_action|total_time|comment|", write_only = "|exit|session_time|", 
  exit = "|time-out|suspend|logout|normal||", errors = {0:"No error", 101:"General exception", 102:"General Initialization Failure", 103:"Already Initialized", 104:"Content Instance Terminated", 111:"General Termination Failure", 112:"Termination Before Initialization", 113:"Termination After Termination", 122:"Retrieve Data Before Initialization", 123:"Retrieve Data After Termination", 132:"Store Data Before Initialization", 133:"Store Data After Termination", 142:"Commit Before Initialization", 
  143:"Commit After Termination", 201:"General Argument Error", 301:"General Get Failure", 351:"General Set Failure", 391:"General Commit Failure", 401:"Undefined Data Model", 402:"Unimplemented Data Model Element", 403:"Data Model Element Value Not Initialized", 404:"Data Model Element Is Read Only", 405:"Data Model Element Is Write Only", 406:"Data Model Element Type Mismatch", 407:"Data Model Element Value Out Of Range", 408:"Data Model Dependency Not Established"}, self = this;
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
  function deepMergeHash(defaults, options) {
    for(var key in options) {
      if(options.hasOwnProperty(key)) {
        if(typeof defaults[key] == "object") {
          if(typeof options[key] == "object") {
            defaults[key] = deepMergeHash(defaults[key], options[key])
          }
        }else {
          defaults[key] = options[key]
        }
      }
    }
    return defaults
  }
  function triggerHandler(eventName, eventParams) {
    (function() {
      if(typeof window.CustomEvent === "function") {
        return false
      }
      function CustomEvent(event, params) {
        params = params || {bubbles:false, cancelable:false, detail:undefined};
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt
      }
      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent
    })();
    document.dispatchEvent(new CustomEvent(eventName, {"detail":eventParams}))
  }
  function isPlainObject(o) {
    if(type(o) !== "object" || (o.nodeType || isWindow(o))) {
      return false
    }
    return!(o.constructor && !hasOwn.call(o.constructor.prototype, "isPrototypeOf"))
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
                  if(!isPlainObject(cmi.interactions[tiers[2]])) {
                    if(tiers[3] === "id") {
                      cmi.interactions[tiers[2]] = {};
                      setData(k.substr(4, k.length), v, cmi);
                      cmi.interactions._count = (getObjLength(cmi.interactions) - 2).toString();
                      if(!isPlainObject(cmi.interactions[tiers[2]].objectives)) {
                        debug(settings.prefix + ": Constructing objectives object for new interaction", 4);
                        cmi.interactions[tiers[2]].objectives = {};
                        cmi.interactions[tiers[2]].objectives._count = "-1"
                      }
                      if(!isPlainObject(cmi.interactions[tiers[2]].correct_responses)) {
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
    triggerHandler("StoreData", {runtimedata:cmi});
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
  this.setCMILMSValue = function(name, value) {
    if(typeof name == "string") {
      settings.CMI[name] = value
    }
  };
  this.addListener = function(event, listener) {
    if(typeof event == "string" && typeof listener == "function") {
      settings.listeners[event] = listener
    }
  }
}
;function Local_API_SCORM_12(options) {
  var defaults = {version:"1.1", prefix:"Local_API_SCORM_12", errorCode:0, diagnostic:"", initialized:0, terminated:0, debug:true, listeners:{}, CMI:{_version:"3.4", comments:"", comments_from_lms:"", launch_data:"", suspend_data:"", core:{entry:"ab-initio", credit:"credit", lesson_status:"not attempted", lesson_mode:"normal", lesson_location:"", student_id:"100", student_name:"Simulated User", student_preference:{_children:"audio,language,speed,text", audio:"0", language:"", speed:"0", text:"0"}, 
  score:{_children:"raw,min,max", raw:"", max:"", min:""}, total_time:"0000:00:00.00", session_time:"", exit:""}, student_data:{_children:"mastery_score,time_limit_action,max_time_allowed", mastery_score:"50", max_time_allowed:"", time_limit_action:"continue,no message"}}}, settings = deepMergeHash(defaults, options), cmi = {}, lesson_status = "|passed|completed|failed|incomplete|browsed|not attempted|unknown|", read_only = "|_version|completion_threshold|credit|entry|launch_data|learner_id|learner_name|_children|_count|mode|maximum_time_allowed|scaled_passing_score|time_limit_action|total_time|comment|", 
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
      case "cmi.core.exit":
      ;
      case "cmi.core.session_time":
        settings.errorCode = 405;
        settings.diagnostic = "Sorry, this has been specified as a read-only value for " + key;
        break;
      default:
        key = key.replace("cmi.", "");
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
  function deepMergeHash(defaults, options) {
    for(var key in options) {
      if(options.hasOwnProperty(key)) {
        if(typeof defaults[key] == "object") {
          if(typeof options[key] == "object") {
            defaults[key] = deepMergeHash(defaults[key], options[key])
          }
        }else {
          defaults[key] = options[key]
        }
      }
    }
    return defaults
  }
  function triggerHandler(eventName, eventParams) {
    (function() {
      if(typeof window.CustomEvent === "function") {
        return false
      }
      function CustomEvent(event, params) {
        params = params || {bubbles:false, cancelable:false, detail:undefined};
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt
      }
      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent
    })();
    document.dispatchEvent(new CustomEvent(eventName, {"detail":eventParams}))
  }
  this.isRunning = function() {
    return settings.initialized === 1 && settings.terminated === 0
  };
  this.LMSInitialize = function() {
    debug(settings.prefix + ":  Initializing...", 3);
    cmi = settings.CMI;
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
                settings.CMI.core.score.min = scoreMin
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.core.score.max":
              var scoreMax = parseFloat(v);
              if(typeof scoreMax == "number" && !isNaN(scoreMax)) {
                settings.CMI.core.score.max = scoreMax
              }else {
                return throwArgumentError(key, v)
              }
              break;
            case "cmi.core.score.raw":
              var rawScore = parseFloat(v);
              if(typeof rawScore == "number" && !isNaN(rawScore)) {
                var maxScore = parseFloat(settings.CMI.core.score.max);
                maxScore = typeof maxScore == "number" && !isNaN(maxScore) ? maxScore : 100;
                var minScore = parseFloat(settings.CMI.core.score.min);
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
          k = k.replace("cmi.", "");
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
    triggerHandler("StoreData", {runtimedata:cmi});
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
  this.setCMILMSValue = function(name, value) {
    if(typeof name == "string") {
      settings.CMI[name] = value
    }
  };
  this.addListener = function(event, listener) {
    if(typeof event == "string" && typeof listener == "function") {
      settings.listeners[event] = listener
    }
  }
}
;SGAME = function() {
  var init = function(options) {
    return SGAME.CORE.init(options)
  };
  var loadSettings = function(settings) {
    return SGAME.CORE.loadSettings(settings)
  };
  var triggerLO = function(event_id, callback) {
    return SGAME.CORE.triggerLO(event_id, callback)
  };
  var showLO = function(lo, callback) {
    return SGAME.CORE.showLO(lo, callback)
  };
  var showRandomLO = function(callback) {
    return SGAME.CORE.showRandomLO(callback)
  };
  var closeLO = function() {
    return SGAME.CORE.closeLO()
  };
  var losCanBeShown = function() {
    return SGAME.CORE.losCanBeShown()
  };
  return{init:init, loadSettings:loadSettings, triggerLO:triggerLO, showLO:showLO, showRandomLO:showRandomLO, closeLO:closeLO, losCanBeShown:losCanBeShown}
}();
SGAME.VERSION = "0.5";
SGAME.AUTHORS = "Aldo Gordillo, Enrique Barra";
SGAME.URL = "https://github.com/ging/sgame_platform";
SGAME.Debugger = function() {
  var _debugging = false;
  var init = function(debugging) {
    if(debugging === true) {
      _debugging = debugging
    }
  };
  var isDebugging = function() {
    return _debugging
  };
  var log = function(msg) {
    if(_debugging && window.console) {
      console.log(msg)
    }
  };
  return{init:init, isDebugging:isDebugging, log:log}
}();
SGAME.API = function() {
  var init = function() {
  };
  var requestLOMetadata = function(loId, successCallback, failCallback) {
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
  return{init:init, requestLOMetadata:requestLOMetadata}
}();
SGAME.CORE = function() {
  var _options = {};
  var _togglePauseFunction = undefined;
  var _settings = {};
  var _settings_loaded = false;
  var supportedRepeatLo = ["repeat", "repeat_unless_successfully_consumed", "no_repeat"];
  var supportedCompletionNotification = ["no_more_los", "all_los_consumed", "all_los_succesfully_consumed", "never"];
  var supportedBehaviourWhenNoMoreLOs = ["success", "failure", "failure_unless_blocking"];
  var _los_can_be_shown = false;
  var _final_screen_shown = false;
  var _final_screen_text = "Congratulations. You have achieved the objectives of this educational game. You may close this window or continue playing.";
  var init = function(options) {
    SGAME.Debugger.log("SGAME init with options ");
    SGAME.Debugger.log(options);
    _options = options;
    if(options) {
      if(typeof options.togglePause === "function") {
        _togglePauseFunction = options.togglePause
      }
    }
  };
  var loadSettings = function(settings) {
    SGAME.Debugger.log("SGAME load settings ");
    SGAME.Debugger.log(settings);
    _settings_loaded = true;
    _loadSettings(settings)
  };
  var _loadSettings = function(settings) {
    _settings = settings;
    if(typeof _settings["game_metadata"] === "undefined") {
      _settings["game_metadata"] = {}
    }
    if(typeof _settings["los"] === "undefined") {
      _settings["los"] = {}
    }
    if(typeof _settings["events"] === "undefined") {
      _settings["events"] = {}
    }
    if(typeof _settings["event_mapping"] === "undefined") {
      _settings["event_mapping"] = {}
    }
    if(typeof _settings["sequencing"] === "undefined") {
      _settings["sequencing"] = {}
    }
    if(supportedRepeatLo.indexOf(_settings["sequencing"]["repeat_lo"]) === -1) {
      _settings["sequencing"]["repeat_lo"] = "repeat"
    }
    if(typeof _settings["game_settings"] === "undefined") {
      _settings["game_settings"] = {}
    }
    if(supportedCompletionNotification.indexOf(_settings["game_settings"]["completion_notification"]) === -1) {
      _settings["game_settings"]["completion_notification"] = "never"
    }
    if(supportedBehaviourWhenNoMoreLOs.indexOf(_settings["game_settings"]["behaviour_when_no_more_los"]) === -1) {
      _settings["game_settings"]["behaviour_when_no_more_los"] = "failure_unless_blocking"
    }
    if(typeof _settings["game_settings"]["completion_notification_text"] === "string") {
      _final_screen_text = _settings["game_settings"]["completion_notification_text"]
    }
    if(typeof _settings["los"] === "object") {
      var lo_ids = Object.keys(_settings["los"]);
      var nLOs = lo_ids.length;
      for(var i = 0;i < nLOs;i++) {
        if(typeof _settings["los"][lo_ids[i]].url !== "undefined") {
          _settings["los"][lo_ids[i]].url = SGAME.Utils.checkUrlProtocol(_settings["los"][lo_ids[i]].url)
        }
        _settings["los"][lo_ids[i]]["can_be_shown"] = true;
        _settings["los"][lo_ids[i]]["shown"] = false;
        _settings["los"][lo_ids[i]]["nshown"] = 0;
        _settings["los"][lo_ids[i]]["succesfully_consumed"] = false;
        _settings["los"][lo_ids[i]]["acts_as_asset"] = _settings["los"][lo_ids[i]]["scorm_type"] === "asset" || _settings["los"][lo_ids[i]]["scorm_type"] === "sco" && _settings["los"][lo_ids[i]]["report_data"] === false;
        _los_can_be_shown = true
      }
    }
  };
  var triggerLO = function(event_id, callback) {
    var los_mapped = [];
    var los_candidate = [];
    var mapped_los_ids = _settings["event_mapping"][event_id];
    if(typeof mapped_los_ids !== "undefined") {
      var n_mapped_los_ids = mapped_los_ids.length;
      if(typeof n_mapped_los_ids === "number") {
        for(var i = 0;i < n_mapped_los_ids;i++) {
          if(mapped_los_ids[i] === "*") {
            los_mapped = _getAllLoArray();
            break
          }
          if(typeof _settings["los"][mapped_los_ids[i]] !== "undefined") {
            los_mapped.push(_settings["los"][mapped_los_ids[i]])
          }
        }
      }
    }
    var nLosMapped = los_mapped.length;
    if(nLosMapped.length < 1) {
      if(typeof callback === "function") {
        var report = _getReportWhenNoLOs(event_id);
        callback(report.success, report)
      }
      return
    }
    for(var j = 0;j < nLosMapped;j++) {
      if(los_mapped[j]["can_be_shown"] === true) {
        los_candidate.push(los_mapped[j])
      }
    }
    if(los_candidate && (los_candidate instanceof Array && los_candidate.length > 0)) {
      selectedLO = _selectLoFromCandidates(los_candidate);
      showLO(selectedLO, callback)
    }else {
      if(typeof callback === "function") {
        var report = _getReportWhenNoLOs(event_id);
        callback(report.success, report)
      }
    }
  };
  var showLO = function(lo, callback) {
    if(typeof lo !== "object" || typeof lo["url"] !== "string") {
      if(typeof callback === "function") {
        callback(null, null)
      }
      return
    }
    _togglePause();
    _settings["los"][lo["id"]]["shown"] = true;
    _settings["los"][lo["id"]]["nshown"] += 1;
    SGAME.Fancybox.create({lo:lo}, function(report) {
      _settings["los"][lo["id"]]["succesfully_consumed"] = report.success;
      switch(_settings["sequencing"]["repeat_lo"]) {
        case "repeat":
          break;
        case "repeat_unless_successfully_consumed":
          _settings["los"][lo["id"]]["can_be_shown"] = _settings["los"][lo["id"]]["succesfully_consumed"] !== true;
          break;
        case "no_repeat":
          _settings["los"][lo["id"]]["can_be_shown"] = false;
          break;
        default:
          break
      }
      _checkLOsToShow();
      report["more_los"] = _los_can_be_shown;
      _checkFinalScreen(function() {
        if(typeof callback === "function") {
          callback(report.success, report)
        }
        _togglePause()
      })
    })
  };
  var showRandomLO = function(callback) {
    SGAME.API.requestLOMetadata(undefined, function(lo_metadata) {
      showLO(lo_metadata, callback)
    }, function() {
      if(typeof callback === "function") {
        callback(null, null)
      }
    })
  };
  var closeLO = function() {
    SGAME.Fancybox.closeCurrentFancybox()
  };
  var losCanBeShown = function() {
    return _los_can_be_shown
  };
  var _togglePause = function() {
    if(typeof _togglePauseFunction === "function") {
      _togglePauseFunction()
    }
  };
  var _checkLOsToShow = function() {
    var lo_ids = Object.keys(_settings["los"]);
    var nLOs = lo_ids.length;
    for(var i = 0;i < nLOs;i++) {
      if(_settings["los"][lo_ids[i]]["can_be_shown"] === true) {
        _los_can_be_shown = true;
        return
      }
    }
    _los_can_be_shown = false
  };
  var _checkFinalScreen = function(callback) {
    if(_shouldShowFinalScreen() !== true) {
      if(typeof callback === "function") {
        callback(false)
      }
    }else {
      _showFinalScreen(callback)
    }
  };
  var _shouldShowFinalScreen = function() {
    if(_final_screen_shown === true) {
      return false
    }
    switch(_settings["game_settings"]["completion_notification"]) {
      case "no_more_los":
        return _los_can_be_shown === false;
      case "all_los_consumed":
        var lo_ids = Object.keys(_settings["los"]);
        var nLOs = lo_ids.length;
        for(var i = 0;i < nLOs;i++) {
          if(_settings["los"][lo_ids[i]]["shown"] === false) {
            return false
          }
        }
        return true;
      case "all_los_succesfully_consumed":
        var lo_ids = Object.keys(_settings["los"]);
        var nLOs = lo_ids.length;
        for(var i = 0;i < nLOs;i++) {
          if(_settings["los"][lo_ids[i]]["succesfully_consumed"] === false) {
            return false
          }
        }
        return true;
      case "never":
        return false;
      default:
        return false
    }
  };
  var _showFinalScreen = function(callback) {
    _final_screen_shown = true;
    SGAME.Fancybox.create({dialog:true, msg:_final_screen_text}, function() {
      if(typeof callback === "function") {
        callback(true)
      }
    })
  };
  var _selectLoFromCandidates = function(los_candidate) {
    var filtered_candidates = [];
    var nShownMin;
    for(var i = 0;i < los_candidate.length;i++) {
      if(typeof nShownMin === "undefined") {
        nShownMin = los_candidate[i]["nshown"]
      }
      if(los_candidate[i]["nshown"] < nShownMin) {
        nShownMin = los_candidate[i]["nshown"];
        filtered_candidates = []
      }
      if(nShownMin === los_candidate[i]["nshown"]) {
        filtered_candidates.push(los_candidate[i])
      }
    }
    return SGAME.Utils.getRandomElement(filtered_candidates)
  };
  var _getAllLoArray = function() {
    var all_los = [];
    var all_lo_ids = Object.keys(_settings["los"]);
    for(var i = 0;i < all_lo_ids.length;i++) {
      if(typeof _settings["los"][all_lo_ids[i]] !== "undefined") {
        all_los.push(_settings["los"][all_lo_ids[i]])
      }
    }
    return all_los
  };
  var _getReportWhenNoLOs = function(event_id) {
    return{lo_metadata:undefined, time:undefined, scorm_success_status:undefined, scorm_scaled_score:undefined, scorm_completion_status:undefined, scorm_progress_measure:undefined, success:_getSuccessWhenNoLOs(event_id), more_los:_los_can_be_shown}
  };
  var _getSuccessWhenNoLOs = function(event_id) {
    var _setting;
    if(_settings_loaded && typeof _settings["game_settings"]["behaviour_when_no_more_los"] !== "undefined") {
      _setting = _settings["game_settings"]["behaviour_when_no_more_los"]
    }else {
      if(typeof _options["behaviour_when_no_more_los"] !== "undefined") {
        _setting = _options["behaviour_when_no_more_los"]
      }else {
        if(typeof _settings["game_settings"]["behaviour_when_no_more_los"] !== "undefined") {
          _setting = _settings["game_settings"]["behaviour_when_no_more_los"]
        }
      }
    }
    return _getSuccessWhenNoLOsForSetting(_setting, event_id)
  };
  var _getSuccessWhenNoLOsForSetting = function(setting, event_id) {
    switch(setting) {
      case "success":
        return true;
      case "failure":
        return false;
      case "failure_unless_blocking":
        var event = _getEventMetadata(event_id);
        if(typeof event === "undefined" || event.type !== "blocking") {
          return false
        }
        return true;
      default:
        return false;
        break
    }
  };
  var _getEventMetadata = function(event_id) {
    if(typeof _settings["events"][event_id] !== "undefined") {
      return _settings["events"][event_id]
    }else {
      if(typeof _options["events"] === "object" && typeof _options["events"][event_id] !== "undefined") {
        return _options["events"][event_id]
      }else {
        return{}
      }
    }
  };
  var _loadInitialSettings = function() {
    if(_settings_loaded === false) {
      _loadSettings({})
    }
  };
  SGAME.Debugger.init(true);
  _loadInitialSettings();
  return{init:init, loadSettings:loadSettings, triggerLO:triggerLO, showLO:showLO, showRandomLO:showRandomLO, closeLO:closeLO, losCanBeShown:losCanBeShown}
}();
var API;
var API_1484_11;
SGAME.Fancybox = function(undefined) {
  var _currentFancybox = undefined;
  var _currentFancyboxMode = undefined;
  var _currentOnCloseCallback = undefined;
  var init = function() {
  };
  var create = function(options, onCloseCallback) {
    _removeCurrentFancybox();
    _currentOnCloseCallback = onCloseCallback;
    var mode = typeof options !== "undefined" && options.dialog === true ? "dialog" : "lo";
    var ar = 4 / 3;
    var minMargin = 0.05;
    var width;
    var height;
    var maxWidth = window.innerWidth * (1 - 2 * minMargin);
    var maxHeight = window.innerHeight * (1 - 2 * minMargin);
    if(maxHeight * ar > maxWidth) {
      width = maxWidth;
      height = width / ar
    }else {
      height = maxHeight;
      width = height * ar
    }
    if(mode === "lo") {
      var lo = {};
      var url
    }else {
      var dialogMsg = ""
    }
    if(options) {
      if(options.width) {
        width = options.width
      }
      if(options.height) {
        height = options.height
      }
      if(mode === "lo") {
        if(options.lo) {
          lo = options.lo;
          if(typeof lo["url"] === "string") {
            url = lo["url"]
          }
        }
      }else {
        if(typeof options.msg == "string") {
          dialogMsg = options.msg
        }
      }
    }
    if(mode === "lo") {
      if(typeof url != "string" || typeof lo.scorm_type == "undefined") {
        return
      }
      var SCORM_API = undefined;
      API = undefined;
      API_1484_11 = undefined;
      if(lo.scorm_type === "sco") {
        if(lo.scorm_version === "1.2") {
          API = new Local_API_SCORM_12({debug:SGAME.Debugger.isDebugging()});
          SCORM_API = API
        }else {
          if(lo.scorm_version === "2004") {
            API_1484_11 = new Local_API_1484_11({debug:SGAME.Debugger.isDebugging()});
            SCORM_API = API_1484_11
          }
        }
      }
    }
    var fancybox = document.createElement("div");
    fancybox.style.width = width + "px";
    fancybox.style.height = height + "px";
    fancybox.style.maxWidth = maxWidth + "px";
    fancybox.style.maxHeight = maxHeight + "px";
    fancybox.style.overflow = mode === "lo" ? "hidden" : "auto";
    fancybox.style.background = "white";
    fancybox.style.position = "absolute";
    fancybox.style.top = 0;
    fancybox.style.zIndex = 9999;
    fancybox.style.borderRadius = "1em";
    fancybox.style.border = "2px solid black";
    fancybox.setAttribute("id", "sgame_fancybox");
    var marginLeft = (window.innerWidth - width) / 2;
    fancybox.style.marginLeft = marginLeft + "px";
    var marginTop = (window.innerHeight - height) / 2;
    fancybox.style.marginTop = marginTop + "px";
    var closeButton = document.createElement("img");
    closeButton.src = "/assets/sgame/close.png";
    var closeButtonDimension = Math.max(25, Math.floor(height * 0.05));
    closeButton.style.width = closeButtonDimension + "px";
    closeButton.style.height = closeButtonDimension + "px";
    closeButton.style.padding = "5px";
    closeButton.style.cursor = "pointer";
    closeButton.style.position = "absolute";
    closeButton.style.right = 0;
    closeButton.onclick = function() {
      closeCurrentFancybox()
    };
    fancybox.appendChild(closeButton);
    if(mode === "lo") {
      var trafficLight = document.createElement("img");
      trafficLight.id = "trafficLight";
      trafficLight.src = "/assets/sgame/trafficLight/trafficLight_red.png";
      var trafficLightHeight = Math.max(40, Math.floor(height * 0.085));
      var trafficLightWidth = Math.max(30, Math.floor(trafficLightHeight * 0.75));
      trafficLight.style.height = trafficLightHeight + "px";
      trafficLight.style.width = trafficLightWidth + "px";
      trafficLight.style.padding = "4px";
      trafficLight.style.position = "absolute";
      trafficLight.style.left = "0px";
      trafficLight.style.top = "0px";
      trafficLight.style.background = "#fff";
      trafficLight.style.borderRadius = "0px 0px 20px 0px";
      trafficLight.style.borderRight = "2px solid black";
      trafficLight.style.borderBottom = "2px solid black";
      fancybox.appendChild(trafficLight);
      var iframe = document.createElement("iframe");
      iframe.src = url;
      var iframeMarginTop = Math.ceil(Math.max(closeButtonDimension, trafficLightHeight)) + 4;
      var iframeMarginBottom = Math.floor(height * 0.02);
      var iframeMarginLeft = Math.floor(width * 0.02);
      var iframeMarginRight = iframeMarginLeft;
      iframe.style.marginLeft = iframeMarginLeft + "px";
      iframe.style.marginTop = iframeMarginTop + "px";
      iframe.style.width = Math.max(0, width - iframeMarginLeft - iframeMarginRight) + "px";
      iframe.style.height = Math.max(0, height - iframeMarginTop - iframeMarginBottom) + "px";
      iframe.style.overflow = "auto";
      iframe.scrolling = "yes";
      iframe.style.frameBorder = "0";
      iframe.style.borderStyle = "none";
      iframe.setAttribute("allowfullscreen", "false");
      fancybox.appendChild(iframe)
    }else {
      var dialog = document.createElement("p");
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
      dialog.style.fontFamily = "initial";
      fancybox.appendChild(dialog)
    }
    _currentFancybox = fancybox;
    _currentFancyboxMode = mode;
    document.body.appendChild(fancybox);
    if(mode === "lo") {
      SGAME.Observer.start(iframe, lo, SCORM_API)
    }
  };
  var _removeCurrentFancybox = function() {
    if(typeof _currentFancybox == "undefined") {
      return
    }
    _currentFancybox.style.display = "none";
    _currentFancybox.parentNode.removeChild(_currentFancybox);
    if(_currentFancyboxMode === "lo") {
      API = undefined;
      API_1484_11 = undefined
    }
    _currentFancybox = undefined;
    _currentFancyboxMode = undefined
  };
  var closeCurrentFancybox = function() {
    if(typeof _currentFancybox == "undefined") {
      return
    }
    var closedFancyboxMode = _currentFancyboxMode;
    _removeCurrentFancybox();
    var callbackResult;
    if(closedFancyboxMode === "lo") {
      callbackResult = SGAME.Observer.stop()
    }else {
      callbackResult = true
    }
    var currentOnCloseCallback = _currentOnCloseCallback;
    _currentOnCloseCallback = undefined;
    setTimeout(function() {
      if(typeof currentOnCloseCallback === "function") {
        currentOnCloseCallback(callbackResult)
      }
    }, 50)
  };
  return{init:init, create:create, closeCurrentFancybox:closeCurrentFancybox}
}();
SGAME.Observer = function(undefined) {
  var _stopped = true;
  var _current_iframe = undefined;
  var _current_lo = undefined;
  var _SCORM_API = undefined;
  var startTime;
  var success;
  var scorm_success_status;
  var scorm_scaled_score;
  var scorm_completion_status;
  var scorm_progress_measure;
  var scorm_scaled_score_threshold = 0.8;
  var start = function(iframe, lo, SCORM_API) {
    if(_stopped === false || typeof _current_iframe != "undefined") {
      return null
    }
    _stopped = false;
    _resetParams();
    _current_iframe = iframe;
    _current_lo = lo;
    _SCORM_API = SCORM_API;
    _loadEvents();
    SGAME.TrafficLight.changeColor("red");
    if(_current_lo.acts_as_asset === true) {
      var requiredTime = _getRequiredTime(_current_lo);
      SGAME.TrafficLight.setUpBlink("yellow", requiredTime * 0.5 - 0.5, requiredTime * 0.5);
      SGAME.TrafficLight.changeColor("green", requiredTime)
    }
  };
  var _resetParams = function() {
    _current_iframe = undefined;
    _current_lo = undefined;
    _SCORM_API = undefined;
    startTime = Date.now();
    success = false;
    scorm_success_status = undefined;
    scorm_scaled_score = undefined;
    scorm_completion_status = undefined;
    scorm_progress_measure = undefined
  };
  var _loadEvents = function() {
    if(_current_lo.acts_as_asset === false && typeof _SCORM_API !== "undefined") {
      _SCORM_API.addListener("cmi.success_status", function(value) {
        scorm_success_status = value;
        if(scorm_success_status === "passed") {
          if(SGAME.TrafficLight.getCurrentColor() != "green") {
            SGAME.TrafficLight.stop();
            SGAME.TrafficLight.changeColor("green")
          }
        }
      });
      _SCORM_API.addListener("cmi.score.scaled", function(value) {
        scorm_scaled_score = value;
        if(scorm_scaled_score >= scorm_scaled_score_threshold) {
          if(SGAME.TrafficLight.getCurrentColor() != "green") {
            SGAME.TrafficLight.stop();
            SGAME.TrafficLight.changeColor("green")
          }
        }
      });
      _SCORM_API.addListener("cmi.completion_status", function(value) {
        scorm_completion_status = value
      });
      _SCORM_API.addListener("cmi.progress_measure", function(value) {
        scorm_progress_measure = value
      })
    }
  };
  var stop = function() {
    if(_stopped === true || typeof _current_iframe == "undefined") {
      return null
    }
    _stopped = true;
    SGAME.TrafficLight.stop();
    var time_spent = Math.round((Date.now() - startTime) / 1E3);
    success = SGAME.TrafficLight.getCurrentColor() === "green";
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
          var TLT = metadata.educational.typicalLearningTime.duration;
          var parsedTLT = iso8601Parser.getDuration(TLT);
          if(parsedTLT) {
            return parsedTLT
          }
        }
      }
    }
    return null
  };
  var _getRequiredTime = function(lo) {
    var defaultTime = 15;
    var maximumTime = 120;
    var alfa = 0.5;
    var TLT = _getTypicalLearningTime(lo["lom_metadata"]);
    if(!TLT || TLT <= 0) {
      return defaultTime
    }
    return Math.min(alfa * TLT, maximumTime)
  };
  return{start:start, stop:stop, isStopped:isStopped}
}();
SGAME.TrafficLight = function(undefined) {
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
    var trafficLight = document.getElementById("trafficLight");
    if(trafficLight) {
      current_color = color;
      trafficLight.src = _getImageForColor(color)
    }
  };
  var _getImageForColor = function(color) {
    switch(color) {
      case "green":
        return"/assets/sgame/trafficLight/trafficLight_green.png";
        break;
      case "yellow":
        return"/assets/sgame/trafficLight/trafficLight_yellow.png";
        break;
      case "red":
        return"/assets/sgame/trafficLight/trafficLight_red.png";
        break;
      default:
        return"/assets/sgame/trafficLight/trafficLight.png";
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
    var trafficLight = document.getElementById("trafficLight");
    if(!trafficLight) {
      return
    }
    var coin = false;
    blinkTimer = setInterval(function() {
      if(!trafficLight) {
        return
      }
      if(coin) {
        trafficLight.src = _getImageForColor(null);
        coin = false
      }else {
        trafficLight.src = _getImageForColor(color);
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
SGAME.Utils = function() {
  var init = function(debugging) {
  };
  var getRandomElement = function(box) {
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
  var loadScript = function(scriptSrc, callback) {
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
  var _protocol = undefined;
  var getProtocol = function() {
    if(typeof _protocol !== "undefined") {
      return _protocol
    }
    var protocol;
    try {
      protocol = document.location.protocol
    }catch(e) {
    }
    if(typeof protocol === "string") {
      var protocolMatch = protocol.match(/[\w]+/);
      if(protocolMatch instanceof Array && typeof protocolMatch[0] === "string") {
        protocol = protocolMatch[0]
      }else {
        protocol = undefined
      }
    }
    if(typeof protocol === "string") {
      _protocol = protocol
    }else {
      _protocol = "unknown"
    }
    return _protocol
  };
  var checkUrlProtocol = function(url) {
    if(typeof url === "string") {
      var protocolMatch = url.match(/^https?:\/\//);
      if(protocolMatch instanceof Array && protocolMatch.length === 1) {
        var urlProtocol = protocolMatch[0].replace("://", "");
        var documentProtocol = SGAME.Utils.getProtocol();
        if(urlProtocol !== documentProtocol) {
          switch(documentProtocol) {
            case "https":
              url = "https" + url.replace(urlProtocol, "");
              break;
            case "http":
              break;
            default:
              break
          }
        }
      }
    }
    return url
  };
  return{init:init, getRandomElement:getRandomElement, loadScript:loadScript, getProtocol:getProtocol, checkUrlProtocol:checkUrlProtocol}
}();

