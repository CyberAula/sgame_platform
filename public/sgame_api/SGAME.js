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
  var createTimestamp = function(period) {
    return(new Date).toISOString()
  };
  return{getDuration:getDuration, createTimestamp:createTimestamp}
}();
function Local_API_1484_11(options) {
  var defaults = {version:"2.4", prefix:"Local_API_1484_11", errorCode:0, diagnostic:"", initialized:0, terminated:0, user:undefined, debug:true, listeners:{}, CMI:{_version:"1.0", comments_from_learner:{_children:"comment,location,timestamp", _count:"0"}, comments_from_lms:{_children:"comment,location,timestamp", _count:"0"}, completion_status:"unknown", completion_threshold:"0.7", credit:"credit", entry:"ab-initio", exit:"", interactions:{_children:"id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description", 
  _count:"0"}, launch_data:"", learner_id:"100", learner_name:"Simulated User", learner_preference:{_children:"audio_level,language,delivery_speed,audio_captioning", audio_level:"1", language:"", delivery_speed:"1", audio_captioning:"0"}, location:"", max_time_allowed:"", mode:"normal", objectives:{_children:"id,score,success_status,completion_status,description", _count:"0"}, progress_measure:"", scaled_passing_score:"0.5", score:{_children:"scaled,raw,min,max", scaled:"", raw:"", min:"", max:""}, 
  session_time:"PT0H0M0S", success_status:"unknown", suspend_data:"", time_limit_action:"", total_time:"PT0H0M0S"}}, settings = deepMergeHash(defaults, options), cmi = {}, completion_status = "|completed|incomplete|not attempted|unknown|", success_status = "|passed|failed|unknown|", read_only = "|_version|completion_threshold|credit|entry|launch_data|learner_id|learner_name|_children|_count|mode|maximum_time_allowed|scaled_passing_score|time_limit_action|total_time|comment|", write_only = "|exit|session_time|", 
  exit = "|time-out|suspend|logout|normal||", errors = {0:"No error", 101:"General exception", 102:"General Initialization Failure", 103:"Already Initialized", 104:"Content Instance Terminated", 111:"General Termination Failure", 112:"Termination Before Initialization", 113:"Termination After Termination", 122:"Retrieve Data Before Initialization", 123:"Retrieve Data After Termination", 132:"Store Data Before Initialization", 133:"Store Data After Termination", 142:"Commit Before Initialization", 
  143:"Commit After Termination", 201:"General Argument Error", 301:"General Get Failure", 351:"General Set Failure", 391:"General Commit Failure", 401:"Undefined Data Model", 402:"Unimplemented Data Model Element", 403:"Data Model Element Value Not Initialized", 404:"Data Model Element Is Read Only", 405:"Data Model Element Is Write Only", 406:"Data Model Element Type Mismatch", 407:"Data Model Element Value Out Of Range", 408:"Data Model Dependency Not Established"}, self = this;
  if(typeof settings.user === "object") {
    if(typeof settings.user.name === "string") {
      settings.CMI.learner_name = settings.user.name
    }
    if(typeof settings.user.id === "string") {
      settings.CMI.learner_id = settings.user.id
    }
  }
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
  var defaults = {version:"1.1", prefix:"Local_API_SCORM_12", errorCode:0, diagnostic:"", initialized:0, terminated:0, user:undefined, debug:true, listeners:{}, CMI:{_version:"3.4", comments:"", comments_from_lms:"", launch_data:"", suspend_data:"", core:{entry:"ab-initio", credit:"credit", lesson_status:"not attempted", lesson_mode:"normal", lesson_location:"", student_id:"100", student_name:"Simulated User", student_preference:{_children:"audio,language,speed,text", audio:"0", language:"", speed:"0", 
  text:"0"}, score:{_children:"raw,min,max", raw:"", max:"", min:""}, total_time:"0000:00:00.00", session_time:"", exit:""}, student_data:{_children:"mastery_score,time_limit_action,max_time_allowed", mastery_score:"50", max_time_allowed:"", time_limit_action:"continue,no message"}}}, settings = deepMergeHash(defaults, options), cmi = {}, lesson_status = "|passed|completed|failed|incomplete|browsed|not attempted|unknown|", read_only = "|_version|completion_threshold|credit|entry|launch_data|learner_id|learner_name|_children|_count|mode|maximum_time_allowed|scaled_passing_score|time_limit_action|total_time|comment|", 
  write_only = "|exit|session_time|", exit = "|time-out|suspend|logout|normal||", errors = {0:"No error", 101:"General exception", 102:"General Initialization Failure", 103:"Already Initialized", 104:"Content Instance Terminated", 111:"General Termination Failure", 112:"Termination Before Initialization", 113:"Termination After Termination", 122:"Retrieve Data Before Initialization", 123:"Retrieve Data After Termination", 132:"Store Data Before Initialization", 133:"Store Data After Termination", 
  142:"Commit Before Initialization", 143:"Commit After Termination", 201:"General Argument Error", 301:"General Get Failure", 351:"General Set Failure", 391:"General Commit Failure", 401:"Undefined Data Model", 402:"Unimplemented Data Model Element", 403:"Data Model Element Value Not Initialized", 404:"Data Model Element Is Read Only", 405:"Data Model Element Is Write Only", 406:"Data Model Element Type Mismatch", 407:"Data Model Element Value Out Of Range", 408:"Data Model Dependency Not Established"}, 
  self = this;
  if(typeof settings.user === "object") {
    if(typeof settings.user.name === "string") {
      settings.CMI.core.student_name = settings.user.name
    }
    if(typeof settings.user.id === "string") {
      settings.CMI.core.student_id = settings.user.id
    }
  }
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
  var getSettings = function() {
    return SGAME.CORE.getSettings()
  };
  var losCanBeShown = function(event_id) {
    return SGAME.CORE.losCanBeShown(event_id)
  };
  var successWhenNoLOs = function(event_id) {
    return SGAME.CORE.successWhenNoLOs(event_id)
  };
  return{init:init, loadSettings:loadSettings, triggerLO:triggerLO, showLO:showLO, showRandomLO:showRandomLO, closeLO:closeLO, getSettings:getSettings, losCanBeShown:losCanBeShown, successWhenNoLOs:successWhenNoLOs}
}();
SGAME.VERSION = "1.0.2";
SGAME.AUTHORS = "Aldo Gordillo";
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
SGAME.Messenger = function() {
  var VALID_TYPES = ["PROTOCOL", "APP"];
  var VALID_ORIGINS = ["SGAME_GATEWAY", "SGAME_API"];
  var ORIGIN = "SGAME_API";
  var DESTINATION = "SGAME_GATEWAY";
  var _initialized = false;
  var _connected = false;
  var init = function(config) {
    if(_initialized) {
      return
    }
    _initialized = true;
    try {
      if(window.parent.addEventListener) {
        window.parent.addEventListener("message", _onMessageReceived, false)
      }else {
        if(window.attachEvent) {
          window.parent.attachEvent("message", _onMessageReceived)
        }
      }
    }catch(e) {
    }
  };
  var isConnected = function() {
    return _connected
  };
  var sendMessage = function(data) {
    if(_initialized && _connected) {
      var message = _createMessage(data);
      if(_validateMessage(message)) {
        _sendMessage(message)
      }
    }
  };
  var _sendMessage = function(message) {
    try {
      window.parent.parent.postMessage(message, "*")
    }catch(e) {
    }
  };
  var _onMessageReceived = function(wrapperedMessage) {
    if(_validateWrapperedMessage(wrapperedMessage)) {
      var message = JSON.parse(wrapperedMessage.data);
      switch(message.type) {
        case "PROTOCOL":
          return _onProtocolMessage(message);
        case "APP":
          return _onAppMessage(message);
        default:
          return
      }
    }
  };
  function IframeMessage(data, type) {
    this.data = data || {};
    if(["PROTOCOL", "APP"].indexOf(type) !== -1) {
      this.type = type
    }else {
      this.type = "APP"
    }
    this.origin = ORIGIN;
    this.destination = DESTINATION
  }
  var _createMessage = function(data, type) {
    return JSON.stringify(new IframeMessage(data, type))
  };
  var _validateWrapperedMessage = function(wrapperedMessage) {
    if(typeof wrapperedMessage !== "object" || typeof wrapperedMessage.data !== "string") {
      return false
    }
    return _validateMessage(wrapperedMessage.data)
  };
  var _validateMessage = function(message) {
    try {
      var message = JSON.parse(message);
      if(VALID_TYPES.indexOf(message.type) === -1 || VALID_ORIGINS.indexOf(message.origin) === -1) {
        return false
      }
    }catch(e) {
      return false
    }
    return true
  };
  var _onProtocolMessage = function(protocolMessage) {
    if(protocolMessage.data) {
      switch(protocolMessage.data.key) {
        case "onIframeMessengerHello":
          if(protocolMessage.origin === "SGAME_GATEWAY") {
            if(_connected !== true) {
              _connected = true;
              var helloMessage = protocolMessage;
              helloMessage.data.settings = SGAME.CORE.getSettings();
              helloMessage.destination = helloMessage.origin;
              helloMessage.origin = ORIGIN;
              _sendMessage(JSON.stringify(helloMessage));
              SGAME.CORE.onConnectedToVLE()
            }
          }
          break;
        default:
          break
      }
    }
  };
  var _onAppMessage = function(appMessage) {
    if(appMessage.data && typeof appMessage.data.key === "string") {
      switch(appMessage.data.key) {
        case "lms_data":
          if(typeof appMessage.data.value === "object") {
            _onUserDataReceived(appMessage.data.value)
          }
          break;
        default:
          break
      }
    }
  };
  var _onUserDataReceived = function(data) {
    var user = {};
    if(typeof data.name === "string" || typeof data.name === "number") {
      user.name = "" + data.name
    }
    if(typeof data.id === "string" || typeof data.id === "number") {
      user.id = "" + data.id
    }
    var vle_data = SGAME.CORE.getVLEData();
    vle_data["user"] = user;
    SGAME.CORE.setVLEData(vle_data)
  };
  return{init:init, isConnected:isConnected, sendMessage:sendMessage}
}();
var API;
var API_1484_11;
SGAME.Fancybox = function(undefined) {
  var _currentFancybox = undefined;
  var _currentFancyboxMode = undefined;
  var _currentOnCloseCallback = undefined;
  var _assetsPath;
  var init = function(assetsPath) {
    if(typeof assetsPath === "string") {
      _assetsPath = assetsPath
    }
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
      var user = undefined;
      var vleData = SGAME.CORE.getVLEData();
      if(typeof vleData.user === "object") {
        user = vleData.user
      }
      if(lo.scorm_type === "sco") {
        if(lo.scorm_version === "1.2") {
          API = new Local_API_SCORM_12({user:user, debug:SGAME.Debugger.isDebugging()});
          SCORM_API = API
        }else {
          if(lo.scorm_version === "2004") {
            API_1484_11 = new Local_API_1484_11({user:user, debug:SGAME.Debugger.isDebugging()});
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
    closeButton.src = _assetsPath + "close.png";
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
      trafficLight.src = _assetsPath + "trafficLight/trafficLight_red.png";
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
SGAME.TrafficLight = function(undefined) {
  var current_color;
  var changeColorTimer;
  var startBlinkTimer;
  var blinkTimer;
  var stopBlinkTimer;
  var _assetsPath;
  var init = function(assetsPath) {
    if(typeof assetsPath === "string") {
      _assetsPath = assetsPath
    }
  };
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
  return{init:init, getCurrentColor:getCurrentColor, changeColor:changeColor, setUpBlink:setUpBlink, stop:stop}
}();
SGAME.Sequencing = function() {
  var _sequencingApproach;
  var supportedGroupRequirements = ["completion", "completion_higher_inmediate", "success", "fail", "score_higher", "score_higher_inmediate", "score_lower"];
  var init = function(seq_settings) {
    _sequencingApproach = seq_settings["approach"]
  };
  var initGroupSequence = function(group) {
    group.can_be_shown = typeof group.condition === "undefined" || Object.keys(group.condition).length === 0;
    group.locked = false;
    group.unlocked = group.can_be_shown;
    group.shown = false;
    group.nshown = 0;
    group.score = false;
    group.performance = 0;
    group.condition = _resetConditionMet(group.condition);
    return group
  };
  var _resetConditionMet = function(condition) {
    if(typeof condition !== "object") {
      return condition
    }
    condition.met = false;
    if(condition.type === "multiple" && Array.isArray(condition.conditions)) {
      for(var i = 0;i < condition.conditions.length;i++) {
        condition.conditions[i] = _resetConditionMet(condition.conditions[i])
      }
    }
    return condition
  };
  var validateSequence = function(sequence, los) {
    if(typeof sequence !== "object" || typeof los !== "object") {
      return false
    }
    var group_ids = Object.keys(sequence);
    var lo_ids = Object.keys(los);
    for(var i = 0;i < group_ids.length;i++) {
      var group = _validateGroup(sequence[group_ids[i]], lo_ids);
      if(group !== false) {
        sequence[group_ids[i]] = group
      }else {
        delete sequence[group_ids[i]]
      }
    }
    sequence = _validateGroupsConditions(sequence);
    var valid_group_ids = Object.keys(sequence);
    var los_in_valid_groups = [];
    for(var j = 0;j < valid_group_ids.length;j++) {
      var group = sequence[valid_group_ids[j]];
      for(var k = 0;k < group.los.length;k++) {
        if(los_in_valid_groups.indexOf(group.los[k]) === -1) {
          los_in_valid_groups.push(group.los[k])
        }
      }
    }
    if(typeof valid_group_ids.length < 2 || los_in_valid_groups.length < 2) {
      return false
    }
    return sequence
  };
  var _validateGroup = function(group, lo_ids) {
    if(typeof group.id === "undefined") {
      return false
    }else {
      group.id = group.id + ""
    }
    var validLos = [];
    for(var i = 0;i < group.los.length;i++) {
      var loId = group.los[i];
      if(lo_ids.indexOf(loId) !== -1) {
        validLos.push(loId)
      }
    }
    group.los = validLos;
    if(group.los.length < 1) {
      return false
    }
    return group
  };
  var _validateGroupsConditions = function(groups) {
    var group_ids = Object.keys(groups);
    var nGroups = group_ids.length;
    for(var i = 0;i < nGroups;i++) {
      if(typeof groups[group_ids[i]].condition !== "undefined") {
        groups[group_ids[i]].condition = _validateGroupCondition(groups[group_ids[i]].condition, group_ids);
        if(groups[group_ids[i]].condition === false) {
          delete groups[group_ids[i]]
        }
      }
    }
    var nNewGroups = Object.keys(groups).length;
    if(nNewGroups === nGroups) {
      return groups
    }else {
      return _validateGroupsConditions(groups)
    }
  };
  var _validateGroupCondition = function(condition, groupIds) {
    if(typeof condition !== "object") {
      return false
    }
    if(typeof condition.id === "undefined") {
      return false
    }else {
      condition.id = condition.id + ""
    }
    switch(condition.type) {
      case "single":
        return _validateSingleGroupCondition(condition, groupIds);
      case "multiple":
        return _validateMultipleGroupCondition(condition, groupIds);
      default:
        return false
    }
  };
  var _validateMultipleGroupCondition = function(condition, groupIds) {
    if(["AND", "OR"].indexOf(condition.operator) === -1) {
      return false
    }
    if(Array.isArray(condition.conditions) === false || condition.conditions.length < 1) {
      return false
    }
    for(var i = 0;i < condition.conditions.length;i++) {
      condition.conditions[i] = _validateGroupCondition(condition.conditions[i], groupIds);
      if(condition.conditions[i] === false) {
        return false
      }
    }
    return condition
  };
  var _validateSingleGroupCondition = function(condition, groupIds) {
    if(typeof condition.group === "undefined") {
      return false
    }else {
      condition.group = condition.group + ""
    }
    if(groupIds.indexOf(condition.group) === -1) {
      return false
    }
    if(supportedGroupRequirements.indexOf(condition.requirement) === -1) {
      return false
    }
    if(["completion_higher_inmediate", "score_higher", "score_higher_inmediate", "score_lower"].indexOf(condition.requirement) !== -1) {
      if(typeof condition.threshold === "string") {
        if(isNaN(condition.threshold) === true) {
          return false
        }
        condition.threshold = parseInt(condition.threshold) / 100
      }
      if(typeof condition.threshold !== "number" || (condition.threshold < 0 || condition.threshold > 1)) {
        return false
      }
      if(condition.requirement === "score_lower" && condition.threshold === 0) {
        return false
      }
    }
    return condition
  };
  var updateGroupsTracking = function(lo, groups, los) {
    var loGroups = lo.groups.length;
    for(var i = 0;i < loGroups;i++) {
      var group = groups[lo.groups[i]];
      if(group.can_be_shown === true) {
        groups[lo.groups[i]] = _updateGroupTracking(group, los)
      }
    }
    var groupUnlockedOrLocked = false;
    var group_ids = Object.keys(groups);
    var nGroups = group_ids.length;
    for(var j = 0;j < nGroups;j++) {
      var ogroup = groups[group_ids[j]];
      if(ogroup.unlocked === false && ogroup.locked === false) {
        groups[group_ids[j]] = _updateGroupUnlock(ogroup, groups);
        if(groups[group_ids[j]].unlocked === true) {
          los = _changeCanBeShownForLOsInGroup(groups[group_ids[j]], los, true);
          groupUnlockedOrLocked = true
        }
      }
    }
    for(var k = 0;k < loGroups;k++) {
      var ogroup = groups[lo.groups[k]];
      if(ogroup.unlocked === true && ogroup.locked === false) {
        groups[lo.groups[k]] = _updateGroupLock(ogroup, groups);
        if(groups[lo.groups[k]].locked === true) {
          los = _changeCanBeShownForLOsInGroup(groups[lo.groups[k]], los, false);
          groupUnlockedOrLocked = true
        }
      }
    }
    var finished = true;
    for(var l = 0;l < nGroups;l++) {
      var ogroup = groups[group_ids[l]];
      if(ogroup.unlocked === true && ogroup.locked === false) {
        finished = false;
        break
      }
    }
    if(finished) {
      los = _unlockLOsWithoutGroup(los)
    }
    if(groupUnlockedOrLocked === true) {
      if(nGroups <= 25) {
        _lastNLOsForTracking = getNLOsForTracking(groups, los)
      }
    }
    return{"groups":groups, "los":los, nLOsForTracking:_lastNLOsForTracking, "finished":finished}
  };
  var _updateGroupTracking = function(group, los) {
    var nLos = group.los.length;
    var nShown = 0;
    var nSuccess = 0;
    for(var i = 0;i < nLos;i++) {
      var lo = los[group.los[i]];
      if(lo.shown === true) {
        nShown += 1
      }
      if(lo.successfully_consumed === true) {
        nSuccess += 1
      }
    }
    group.shown = nShown === nLos;
    group.nshown = nShown;
    group.score = nLos > 0 ? nSuccess / nLos : 0;
    group.performance = nShown > 0 ? nSuccess / nShown : 0;
    return group
  };
  var _updateGroupUnlock = function(group, groups) {
    if(group.locked === true || group.unlocked === true) {
      return group
    }
    if(typeof group.condition !== "undefined") {
      group.condition = _checkCondition(group.condition, groups);
      if(group.condition.met === true) {
        group.unlocked = true;
        group.can_be_shown = true
      }
    }else {
      group.unlocked = true;
      group.can_be_shown = true
    }
    return group
  };
  var _checkCondition = function(condition, groups) {
    if(typeof condition === "undefined" || condition.met === true) {
      return condition
    }
    switch(condition.type) {
      case "single":
        condition = _checkSingleCondition(condition, groups);
        break;
      case "multiple":
        condition = _checkMultipleCondition(condition, groups);
        break
    }
    return condition
  };
  var _checkMultipleCondition = function(condition, groups) {
    for(var i = 0;i < condition.conditions.length;i++) {
      condition.conditions[i] = _checkCondition(condition.conditions[i], groups);
      if(condition.operator === "OR" && condition.conditions[i].met === true) {
        condition.met = true;
        return condition
      }else {
        if(condition.operator === "AND" && condition.conditions[i].met === false) {
          condition.met = false;
          return condition
        }
      }
    }
    if(condition.operator === "OR") {
      condition.met = false
    }else {
      if(condition.operator === "AND") {
        condition.met = true
      }
    }
    return condition
  };
  var _checkSingleCondition = function(condition, groups) {
    var cgroup = groups[condition.group];
    var cgroupShown = cgroup.shown === true;
    var cmet = false;
    switch(condition.requirement) {
      case "completion":
        cmet = cgroupShown;
        break;
      case "completion_higher_inmediate":
        cmet = cgroup.nshown / cgroup.los.length >= condition.threshold;
        break;
      case "success":
        cmet = cgroupShown && cgroup.score === 1;
        break;
      case "fail":
        cmet = cgroupShown && cgroup.score < 1;
        break;
      case "score_higher":
        cmet = cgroupShown && cgroup.score >= condition.threshold;
        break;
      case "score_higher_inmediate":
        cmet = cgroup.score >= condition.threshold;
        break;
      case "score_lower":
        cmet = cgroupShown && cgroup.score < condition.threshold;
        break
    }
    condition.met = cmet;
    return condition
  };
  var _updateGroupLock = function(group, groups) {
    if(group.locked === true || group.unlocked === false) {
      return group
    }
    var lock = _getLockForGroup(group, groups);
    group.locked = lock;
    group.can_be_shown = group.locked === false;
    return group
  };
  var _getLockForGroup = function(group, groups) {
    var group_ids = Object.keys(groups);
    var groupsWaiting = false;
    for(var j = 0;j < group_ids.length;j++) {
      var ogroup = groups[group_ids[j]];
      if(ogroup.id != group.id && typeof ogroup.condition !== "undefined") {
        var rconditions = _getConditionsRelatedToGroup(ogroup.condition, group);
        for(var k = 0;k < rconditions.length;k++) {
          if(rconditions[k].met === true) {
            return true
          }else {
            if(ogroup.unlocked === false) {
              groupsWaiting = true
            }
          }
        }
      }
    }
    if(groupsWaiting === true) {
      return false
    }
    switch(_sequencingApproach) {
      case "linear_success":
        return group.score === 1;
      case "linear_completion":
      ;
      case "custom":
      ;
      default:
        return group.shown === true
    }
  };
  var _getConditionsRelatedToGroup = function(gcondition, group) {
    switch(gcondition.type) {
      case "single":
        if(gcondition.group === group.id) {
          return[gcondition]
        }
        break;
      case "multiple":
        var conditions = [];
        for(var i = 0;i < gcondition.conditions.length;i++) {
          conditions = conditions.concat(_getConditionsRelatedToGroup(gcondition.conditions[i], group))
        }
        return conditions
    }
    return[]
  };
  var _changeCanBeShownForLOsInGroup = function(group, los, canBeShown) {
    for(var i = 0;i < group.los.length;i++) {
      los[group.los[i]]["can_be_shown"] = canBeShown
    }
    return los
  };
  var _unlockLOsWithoutGroup = function(los) {
    var lo_ids = Object.keys(los);
    for(var i = 0;i < lo_ids.length;i++) {
      if(typeof los[lo_ids[i]].groups === "undefined" || los[lo_ids[i]].groups.length === 0) {
        los[lo_ids[i]]["can_be_shown"] = true
      }
    }
    return los
  };
  var _lastNLOsForTracking = undefined;
  var _nLOsWithoutGroup = undefined;
  var getNLOsForTracking = function(groups, los) {
    if(typeof _nLOsWithoutGroup === "undefined") {
      if(typeof los !== "undefined") {
        _nLOsWithoutGroup = _getIdsLOsWithoutGroup(los).length
      }
      _nLOsWithoutGroup = 0
    }
    var nLOsInSequence;
    switch(_sequencingApproach) {
      case "linear_success":
      ;
      case "linear_completion":
        if(typeof _lastNLOsForTracking !== "undefined") {
          return _lastNLOsForTracking
        }
        nLOsInSequence = _getLinearSequencePathLength(groups);
        break;
      case "custom":
        nLOsInSequence = _getSequencePathLength(groups);
        break;
      default:
        nLOsInSequence = 0
    }
    _lastNLOsForTracking = nLOsInSequence + _nLOsWithoutGroup;
    return _lastNLOsForTracking
  };
  var _getLinearSequencePathLength = function(path) {
    var length = 0;
    var groupIds = Object.keys(path);
    var nGroups = groupIds.length;
    for(var i = 0;i < nGroups;i++) {
      length += path[groupIds[i]].los.length
    }
    return length
  };
  var _getSequencePathLength = function(path) {
    var _groups = JSON.parse(JSON.stringify(path));
    var groupIds = Object.keys(_groups);
    var nGroups = groupIds.length;
    var steps = [];
    for(var i = 0;i < nGroups;i++) {
      var group = _groups[groupIds[i]];
      if(group.unlocked === false && (typeof group.condition !== "undefined" && group.locked === false)) {
        for(var j = 0;j < nGroups;j++) {
          var ogroup = _groups[groupIds[j]];
          if(ogroup.unlocked === true && (ogroup.locked === false && ogroup.id !== group.id)) {
            var rconditions = _getConditionsRelatedToGroup(group.condition, ogroup);
            if(rconditions.length > 0 && rconditions[0].met === false) {
              var rcondition = rconditions[0];
              var newStep = {conditionsToMet:[], groupsToLock:[], groupsToUnlock:[]};
              newStep.conditionsToMet.push({id:rcondition.id, group:group.id});
              newStep.groupsToLock.push(ogroup.id);
              if(group.condition.type === "multiple" && group.condition.operator === "OR" || group.condition.type === "single") {
                newStep.groupsToUnlock.push(group.id)
              }else {
                if(group.condition.type === "multiple" && group.condition.operator === "AND") {
                  if(_metCondition(rcondition.id, JSON.parse(JSON.stringify(group.condition))).met === true) {
                    newStep.groupsToUnlock.push(group.id)
                  }
                }
              }
              for(var k = 0;k < nGroups;k++) {
                var dgroup = _groups[groupIds[k]];
                if(dgroup.unlocked === false && (dgroup.locked === false && (dgroup.id !== group.id && (dgroup.id !== ogroup.id && typeof dgroup.condition !== "undefined")))) {
                  var drconditions = _getConditionsRelatedToGroup(dgroup.condition, ogroup);
                  if(drconditions.length > 0 && drconditions[0].met === false) {
                    var multipleMet = false;
                    switch(rconditions[0].requirement) {
                      case "completion":
                      ;
                      case "completion_higher_inmediate":
                        multipleMet = true;
                        break;
                      case "success":
                        multipleMet = ["fail", "score_lower"].indexOf(drconditions[0].requirement) === -1;
                        break;
                      case "fail":
                        if(["score_higher", "score_higher_inmediate", "score_lower"].indexOf(drconditions[0].requirement) !== -1) {
                          multipleMet = drconditions[0].threshold !== 100
                        }else {
                          multipleMet = ["success"].indexOf(drconditions[0].requirement) === -1
                        }
                        break;
                      case "score_higher":
                      ;
                      case "score_higher_inmediate":
                        if(["success"].indexOf(drconditions[0].requirement) !== -1) {
                          multipleMet = rconditions[0].threshold === 100
                        }else {
                          if(["fail"].indexOf(drconditions[0].requirement) !== -1) {
                            multipleMet = rconditions[0].threshold < 100
                          }else {
                            if(["score_lower"].indexOf(drconditions[0].requirement) !== -1) {
                              multipleMet = drconditions[0].threshold > rconditions[0].threshold
                            }else {
                              multipleMet = true
                            }
                          }
                        }
                        break;
                      case "score_lower":
                        if(["score_higher", "score_higher_inmediate"].indexOf(drconditions[0].requirement) !== -1) {
                          multipleMet = rconditions[0].threshold > drconditions[0].threshold
                        }else {
                          multipleMet = ["success"].indexOf(drconditions[0].requirement) === -1
                        }
                        break
                    }
                    if(multipleMet) {
                      newStep.conditionsToMet.push({id:drconditions[0].id, group:dgroup.id});
                      if(dgroup.condition.type === "multiple" && dgroup.condition.operator === "OR" || dgroup.condition.type === "single") {
                        newStep.groupsToUnlock.push(dgroup.id)
                      }else {
                        if(dgroup.condition.type === "multiple" && dgroup.condition.operator === "AND") {
                          if(_metCondition(drconditions[0].id, JSON.parse(JSON.stringify(dgroup.condition))).met === true) {
                            newStep.groupsToUnlock.push(dgroup.id)
                          }
                        }
                      }
                    }
                  }
                }
              }
              steps.push(newStep)
            }
          }
        }
      }
    }
    var nSteps = steps.length;
    if(nSteps === 0) {
      return _getLOsInUnlockedGroups(_groups)
    }else {
      var maxLength = 0;
      for(var l = 0;l < nSteps;l++) {
        var newPath = JSON.parse(JSON.stringify(_groups));
        for(var x = 0;x < steps[l].groupsToLock.length;x++) {
          newPath[steps[l].groupsToLock[x]].locked = true
        }
        for(var y = 0;y < steps[l].groupsToUnlock.length;y++) {
          newPath[steps[l].groupsToUnlock[y]].unlocked = true
        }
        for(var z = 0;z < steps[l].conditionsToMet.length;z++) {
          newPath[steps[l].conditionsToMet[z].group].condition = _metCondition(steps[l].conditionsToMet[z].id, newPath[steps[l].conditionsToMet[z].group].condition)
        }
        var pathLength = _getSequencePathLength(newPath);
        if(pathLength > maxLength) {
          maxLength = pathLength
        }
      }
      return maxLength
    }
  };
  var _getLOsInUnlockedGroups = function(groups) {
    var _nLOs = 0;
    var groupIds = Object.keys(groups);
    var nGroups = groupIds.length;
    for(var i = 0;i < nGroups;i++) {
      var group = groups[groupIds[i]];
      if(group.unlocked === true && Array.isArray(group.los)) {
        _nLOs += group.los.length
      }
    }
    return _nLOs
  };
  var _metCondition = function(conditionId, condition) {
    if(condition.id === conditionId) {
      condition.met = true
    }else {
      if(condition.type === "multiple") {
        condition.met = condition.operator === "AND";
        for(var i = 0;i < condition.conditions.length;i++) {
          condition.conditions[i] = _metCondition(conditionId, condition.conditions[i]);
          if(condition.conditions[i].met !== true && condition.operator === "AND") {
            condition.met = false
          }else {
            if(condition.conditions[i].met === true && condition.operator === "OR") {
              condition.met = true;
              break
            }
          }
        }
      }
    }
    return condition
  };
  var _getIdsLOsWithoutGroup = function(los) {
    var losWithoutGroup = [];
    var lo_ids = Object.keys(los);
    for(var i = 0;i < lo_ids.length;i++) {
      if(typeof los[lo_ids[i]].groups === "undefined" || los[lo_ids[i]].groups.length === 0) {
        losWithoutGroup.push(lo_ids[i])
      }
    }
    return losWithoutGroup
  };
  var _printPath = function(path) {
    var print = "";
    var groupIds = Object.keys(path);
    for(var i = 0;i < groupIds.length;i++) {
      var group = path[groupIds[i]];
      if(group.unlocked === true) {
        if(print !== "") {
          print += " > "
        }
        print += group.name
      }
    }
    console.log(print)
  };
  return{init:init, initGroupSequence:initGroupSequence, validateSequence:validateSequence, getNLOsForTracking:getNLOsForTracking, updateGroupsTracking:updateGroupsTracking}
}();
SGAME.Analytics = function(undefined) {
  var lrs;
  var actor;
  var gameURL;
  var attemptId;
  var statements;
  var init = function(settings) {
    lrs = settings["lrs"];
    if(typeof settings["player"] == "object" && (typeof settings["player"]["url"] == "string" && typeof settings["player"]["name"] == "string")) {
      actor = {};
      actor["id"] = settings["player"]["url"];
      actor["name"] = settings["player"]["name"]
    }
    gameURL = settings["game_metadata"]["url"];
    if(typeof settings["attemptId"] == "string") {
      attemptId = settings["attemptId"]
    }
    statements = [];
    recordGameAccessed()
  };
  var onVLEDataReceived = function(data) {
    if(typeof data.user === "object") {
      var user = {};
      if(typeof data.user.id === "string") {
        user["id"] = data.user.id
      }
      if(typeof data.user.name === "string") {
        user["name"] = data.user.name
      }
      if(Object.keys(user).length > 0) {
        if(typeof actor === "undefined") {
          actor = user;
          recordGameAccessed()
        }
      }
    }
  };
  var recordGameAccessed = function() {
    return _createStatement("http://activitystrea.ms/schema/1.0/access", gameURL)
  };
  var recordGameClosed = function(tracking) {
    var result = {"completion":tracking.completion_status === "completed", "success":tracking.success_status === "passed", "score":{"scaled":tracking.score}};
    return _createStatement("http://activitystrea.ms/schema/1.0/close", gameURL, result)
  };
  var recordGameCompleted = function(tracking) {
    var result = {"completion":tracking.completion_status === "completed", "success":tracking.success_status === "passed", "score":{"scaled":tracking.score}};
    return _createStatement("http://activitystrea.ms/schema/1.0/complete", gameURL, result)
  };
  var recordLOAccessed = function(lo) {
    return _createStatement("http://activitystrea.ms/schema/1.0/access", lo["url"])
  };
  var recordLOClosed = function(lo, report) {
    var result = {"completion":report.scorm_completion_status === "completed", "success":report.success, "score":{"scaled":report.scorm_scaled_score}};
    return _createStatement("http://activitystrea.ms/schema/1.0/close", lo["url"], result)
  };
  var _createStatement = function(verbId, objectId, result, xapi) {
    var statement = {};
    if(typeof verbId !== "undefined") {
      statement["verb"] = {id:verbId}
    }
    if(typeof objectId !== "undefined") {
      statement["object"] = {id:objectId}
    }
    if(typeof result !== "undefined") {
      statement["result"] = result
    }
    statement["timestamp"] = iso8601Parser.createTimestamp();
    if(xapi === true) {
      statement = _processStatementForXAPI(statement)
    }
    statements.push(statement);
    return statement
  };
  var _processStatementForXAPI = function(statement) {
    if(typeof actor !== "undefined") {
      statement["actor"] = actor
    }
    var context = {};
    if(typeof statement["object"] == "object" && typeof statement["object"]["id"] == "string") {
      if(statement["object"]["id"] != gameURL) {
        context["contextActivities"] = {"parent":{"id":gameURL}}
      }
    }
    if(typeof attemptId === "string") {
      context["extensions"] = {"http://id.tincanapi.com/extension/attempt-id":attemptId}
    }
    if(Object.keys(context).length > 0) {
      statement["context"] = context
    }
    statement["authority"] = {"name":SGAME.URL, "version":SGAME.VERSION};
    return statement
  };
  var storeAnalytics = function() {
    if(typeof lrs == "undefined") {
      return
    }
    var analytics = {};
    if(typeof actor !== "undefined") {
      analytics["actor"] = actor
    }
    if(typeof attemptId === "string") {
      analytics["attemptId"] = attemptId
    }
    analytics["statements"] = statements
  };
  return{init:init, onVLEDataReceived:onVLEDataReceived, recordGameAccessed:recordGameAccessed, recordGameClosed:recordGameClosed, recordGameCompleted:recordGameCompleted, recordLOAccessed:recordLOAccessed, recordLOClosed:recordLOClosed, storeAnalytics:storeAnalytics}
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
  var _final_screen_text = "Congratulations. You have achieved the objectives of this educational game. You may close this window or continue playing.";
  var _settings = {};
  var _settings_loaded = false;
  var _vle_data = {};
  var _tracking = {progress_measure:0, completion_status:"incompleted", score:0, success_status:"unknown"};
  var supportedEventTypes = ["reward", "damage", "blocking", "no-effect"];
  var supportedRepeatLo = ["repeat", "repeat_unless_successfully_consumed", "no_repeat"];
  var supportedInterruptions = ["no_restrictions", "n_times", "1_per_timeperiod"];
  var supportedSequencingApproach = ["random", "linear_completion", "linear_success", "custom"];
  var supportedCompletionStatus = ["all_los", "percentage_los", "n_los", "n_times", "disabled", "onstart"];
  var supportedSuccessStatus = ["all_los", "percentage_los", "n_los", "n_times", "disabled", "onstart", "oncompletion"];
  var supportedCompletionNotification = ["no_more_los", "all_los_consumed", "all_los_successfully_consumed", "completion_status", "success_status", "never"];
  var supportedBehaviourWhenNoMoreLOs = ["success", "failure", "success_unless_damage", "failure_unless_blocking"];
  var _los_can_be_shown = false;
  var _nLOs = 0;
  var _nloshown = 0;
  var _nshown = 0;
  var _nlosuccess = 0;
  var _nsuccess = 0;
  var _final_screen_shown = false;
  var _lastLoTimeStamp = undefined;
  var _sequence_enabled = false;
  var _sequence_finished = false;
  var _nLOsForTrackingWhenSequence = 0;
  var _analyticsEnabled = false;
  var init = function(options) {
    SGAME.Debugger.log("SGAME init with options ");
    SGAME.Debugger.log(options);
    _options = options;
    if(options) {
      if(typeof options.togglePause === "function") {
        _togglePauseFunction = options.togglePause
      }
    }
    window.addEventListener("unload", function() {
      _onExit()
    })
  };
  var loadSettings = function(settings) {
    SGAME.Debugger.log("SGAME load settings ");
    SGAME.Debugger.log(settings);
    _settings_loaded = true;
    _loadSettings(settings);
    SGAME.Debugger.log("SGAME settings loaded");
    SGAME.Debugger.log(_settings)
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
    if(supportedInterruptions.indexOf(_settings["sequencing"]["interruptions"]) === -1) {
      _settings["sequencing"]["interruptions"] = "no_restrictions"
    }
    if(supportedSequencingApproach.indexOf(_settings["sequencing"]["approach"]) === -1) {
      _settings["sequencing"]["approach"] = "random"
    }
    if(["n_times", "1_per_timeperiod"].indexOf(_settings["sequencing"]["interruptions"]) === -1 || typeof _settings["sequencing"]["interruptions_n"] !== "number") {
      delete _settings["sequencing"]["interruptions_n"]
    }
    if(["n_times", "1_per_timeperiod"].indexOf(_settings["sequencing"]["interruptions"]) !== -1 && typeof _settings["sequencing"]["interruptions_n"] !== "number") {
      _settings["sequencing"]["interruptions"] = "no_restrictions"
    }
    if(typeof _settings["game_settings"] === "undefined") {
      _settings["game_settings"] = {}
    }
    if(supportedCompletionStatus.indexOf(_settings["game_settings"]["completion_status"]) === -1) {
      _settings["game_settings"]["completion_status"] = "disabled"
    }
    if(["percentage_los", "n_los", "n_times"].indexOf(_settings["game_settings"]["completion_status"]) === -1 || typeof _settings["game_settings"]["completion_status_n"] !== "number") {
      delete _settings["game_settings"]["completion_status_n"]
    }
    if(["percentage_los", "n_los", "n_times"].indexOf(_settings["game_settings"]["completion_status"]) !== -1 && typeof _settings["game_settings"]["completion_status_n"] !== "number") {
      _settings["game_settings"]["completion_status"] = "disabled";
      delete _settings["game_settings"]["completion_status_n"]
    }
    if(supportedSuccessStatus.indexOf(_settings["game_settings"]["success_status"]) === -1) {
      _settings["game_settings"]["success_status"] = "disabled"
    }
    if(["percentage_los", "n_los", "n_times"].indexOf(_settings["game_settings"]["success_status"]) === -1 || typeof _settings["game_settings"]["success_status_n"] !== "number") {
      delete _settings["game_settings"]["success_status_n"]
    }
    if(["percentage_los", "n_los", "n_times"].indexOf(_settings["game_settings"]["success_status"]) !== -1 && typeof _settings["game_settings"]["success_status_n"] !== "number") {
      _settings["game_settings"]["success_status"] = "disabled";
      delete _settings["game_settings"]["success_status_n"]
    }
    if(supportedCompletionNotification.indexOf(_settings["game_settings"]["completion_notification"]) === -1) {
      _settings["game_settings"]["completion_notification"] = "never"
    }
    if(supportedBehaviourWhenNoMoreLOs.indexOf(_settings["game_settings"]["behaviour_when_no_more_los"]) === -1) {
      _settings["game_settings"]["behaviour_when_no_more_los"] = "success_unless_damage"
    }
    if(typeof _settings["game_settings"]["completion_notification_text"] === "string") {
      _final_screen_text = _settings["game_settings"]["completion_notification_text"]
    }
    if(typeof _settings["los"] === "object") {
      var lo_ids = Object.keys(_settings["los"]);
      _nLOs = lo_ids.length;
      for(var i = 0;i < _nLOs;i++) {
        if(typeof _settings["los"][lo_ids[i]].url !== "undefined") {
          _settings["los"][lo_ids[i]].url = SGAME.Utils.checkUrlProtocol(_settings["los"][lo_ids[i]].url)
        }
        _settings["los"][lo_ids[i]]["can_be_shown"] = true;
        _settings["los"][lo_ids[i]]["shown"] = false;
        _settings["los"][lo_ids[i]]["nshown"] = 0;
        _settings["los"][lo_ids[i]]["successfully_consumed"] = false;
        _settings["los"][lo_ids[i]]["nsuccess"] = 0;
        _settings["los"][lo_ids[i]]["unsuccessfully_consumed"] = false;
        _settings["los"][lo_ids[i]]["acts_as_asset"] = _settings["los"][lo_ids[i]]["scorm_type"] === "asset" || _settings["los"][lo_ids[i]]["scorm_type"] === "sco" && _settings["los"][lo_ids[i]]["report_data"] === false;
        _los_can_be_shown = true
      }
    }
    if(_settings["sequencing"]["approach"] !== "random") {
      var validatedSequence = SGAME.Sequencing.validateSequence(_settings["sequencing"]["sequence"], _settings["los"]);
      if(validatedSequence === false) {
        _settings["sequencing"]["approach"] = "random"
      }else {
        _settings["sequencing"]["sequence"] = validatedSequence;
        _sequence_enabled = true
      }
    }
    if(_settings["sequencing"]["approach"] === "random") {
      delete _settings["sequencing"]["sequence"]
    }
    if(_sequence_enabled === true) {
      var lo_ids = Object.keys(_settings["los"]);
      _nLOs = lo_ids.length;
      for(var x = 0;x < _nLOs;x++) {
        _settings["los"][lo_ids[x]]["can_be_shown"] = false;
        _settings["los"][lo_ids[x]].groups = []
      }
      _los_can_be_shown = false;
      var group_ids = Object.keys(_settings["sequencing"]["sequence"]);
      _nGroups = group_ids.length;
      for(var j = 0;j < _nGroups;j++) {
        _settings["sequencing"]["sequence"][group_ids[j]] = SGAME.Sequencing.initGroupSequence(_settings["sequencing"]["sequence"][group_ids[j]]);
        var group = _settings["sequencing"]["sequence"][group_ids[j]];
        for(var l = 0;l < group.los.length;l++) {
          _settings["los"][group.los[l]].groups.push(group.id);
          _settings["los"][group.los[l]]["can_be_shown"] = group["can_be_shown"] === true;
          if(_settings["los"][group.los[l]]["can_be_shown"] === true) {
            _los_can_be_shown = true
          }
        }
      }
      for(var y = 0;y < _nLOs;y++) {
        if(typeof _settings["los"][lo_ids[y]].groups === "undefined" || _settings["los"][lo_ids[y]].groups.length === 0) {
          delete _settings["los"][lo_ids[y]]
        }
      }
      _nLOs = Object.keys(_settings["los"]).length
    }
    if(typeof _settings["assets_path"] !== "string") {
      _settings["assets_path"] = "/assets/sgame/"
    }
    _analyticsEnabled = typeof settings["lrs"] == "string";
    if(_analyticsEnabled === true) {
      SGAME.Analytics.init(_settings)
    }
    SGAME.Messenger.init();
    SGAME.Fancybox.init(_settings["assets_path"]);
    SGAME.TrafficLight.init(_settings["assets_path"]);
    SGAME.Sequencing.init(_settings["sequencing"]);
    if(_sequence_enabled === true) {
      _nLOsForTrackingWhenSequence = SGAME.Sequencing.getNLOsForTracking(_settings["sequencing"]["sequence"], _settings["los"])
    }
  };
  var _onExit = function() {
    if(_settings_loaded === true && _analyticsEnabled === true) {
      SGAME.Analytics.recordGameClosed(_tracking);
      SGAME.Analytics.storeAnalytics()
    }
  };
  var triggerLO = function(event_id, callback) {
    switch(_settings["sequencing"]["interruptions"]) {
      case "no_restrictions":
        return _triggerLO(event_id, callback);
      case "n_times":
        if(_nshown >= _settings["sequencing"]["interruptions_n"]) {
          return _abortTriggerLO(event_id, callback)
        }else {
          return _triggerLO(event_id, callback)
        }
      ;
      case "1_per_timeperiod":
        if(typeof _lastLoTimeStamp !== "undefined") {
          var timeSinceLastLo = (new Date - _lastLoTimeStamp) / 1E3;
          if(timeSinceLastLo <= _settings["sequencing"]["interruptions_n"]) {
            return _abortTriggerLO(event_id, callback)
          }
        }
        return _triggerLO(event_id, callback);
      default:
        break
    }
  };
  var _triggerLO = function(event_id, callback) {
    var los_mapped = _getMappedLOs(event_id);
    if(los_mapped.length < 1) {
      return _abortTriggerLO(event_id, callback)
    }
    var los_candidate = _getCandidateLOsFromMappedLOs(los_mapped);
    if(los_candidate.length > 0) {
      selectedLO = _selectLoFromCandidates(los_candidate);
      showLO(selectedLO, callback)
    }else {
      if(typeof callback === "function") {
        var report = _getReportWhenNoLOs(event_id);
        callback(report.success, report)
      }
    }
  };
  var _abortTriggerLO = function(event_id, callback) {
    if(typeof callback === "function") {
      var report = _getReportWhenNoLOs(event_id);
      callback(report.success, report)
    }
  };
  var _getMappedLOs = function(event_id) {
    var los_mapped = [];
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
    return los_mapped
  };
  var _getCandidateLOsFromMappedLOs = function(los_mapped) {
    var los_candidate = [];
    var nLosMapped = los_mapped.length;
    for(var i = 0;i < nLosMapped;i++) {
      if(los_mapped[i]["can_be_shown"] === true) {
        los_candidate.push(los_mapped[i])
      }
    }
    return los_candidate
  };
  var _getCandidateLOs = function(event_id) {
    return _getCandidateLOsFromMappedLOs(_getMappedLOs(event_id))
  };
  var showLO = function(lo, callback) {
    if(typeof lo !== "object" || typeof lo["url"] !== "string") {
      if(typeof callback === "function") {
        callback(null, null)
      }
      return
    }
    _lastLoTimeStamp = new Date;
    _togglePause();
    _settings["los"][lo["id"]]["shown"] = true;
    _settings["los"][lo["id"]]["nshown"] += 1;
    if(_analyticsEnabled === true) {
      SGAME.Analytics.recordLOAccessed(lo)
    }
    SGAME.Fancybox.create({lo:lo}, function(report) {
      if(_settings["los"][lo["id"]]["successfully_consumed"] !== true) {
        _settings["los"][lo["id"]]["successfully_consumed"] = report.success
      }
      if(report.success === true) {
        _settings["los"][lo["id"]]["nsuccess"] += 1
      }else {
        _settings["los"][lo["id"]]["unsuccessfully_consumed"] = true
      }
      if(_sequence_enabled === true && _sequence_finished === false) {
        var output = SGAME.Sequencing.updateGroupsTracking(_settings["los"][lo["id"]], _settings["sequencing"]["sequence"], _settings["los"]);
        _settings["sequencing"]["sequence"] = output.groups;
        _settings["los"] = output.los;
        _nLOsForTrackingWhenSequence = output.nLOsForTracking;
        if(output.finished) {
          _sequence_finished = true
        }
      }
      switch(_settings["sequencing"]["repeat_lo"]) {
        case "repeat":
          break;
        case "repeat_unless_successfully_consumed":
          _settings["los"][lo["id"]]["can_be_shown"] = _settings["los"][lo["id"]]["successfully_consumed"] !== true;
          break;
        case "no_repeat":
          _settings["los"][lo["id"]]["can_be_shown"] = false;
          break;
        default:
          break
      }
      _updateFlagsAndTracking();
      report["more_los"] = _los_can_be_shown;
      if(_analyticsEnabled === true) {
        SGAME.Analytics.recordLOClosed(lo, report)
      }
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
  var getSettings = function() {
    return _settings
  };
  var losCanBeShown = function(event_id) {
    if(_los_can_be_shown === false) {
      return false
    }
    if(typeof event_id === "undefined") {
      return _los_can_be_shown
    }
    return _getCandidateLOs(event_id).length > 0
  };
  var successWhenNoLOs = function(event_id) {
    return _getSuccessWhenNoLOs(event_id)
  };
  var onConnectedToVLE = function() {
    if(_settings["game_settings"]["completion_status"] === "onstart") {
      _tracking["progress_measure"] = 1;
      _tracking["completion_status"] = "completed"
    }
    if(_settings["game_settings"]["success_status"] === "onstart") {
      _tracking["score"] = 1;
      _tracking["success_status"] = "passed"
    }
    if(_settings["game_settings"]["completion_status"] === "onstart" || _settings["game_settings"]["success_status"] === "onstart") {
      SGAME.Messenger.sendMessage({key:"tracking", value:_tracking});
      setTimeout(function() {
        if(_shouldShowFinalScreen() === true) {
          _togglePause();
          _checkFinalScreen(function() {
            _togglePause()
          })
        }
      }, 500)
    }
  };
  var getVLEData = function() {
    return _vle_data
  };
  var setVLEData = function(data) {
    _vle_data = data;
    if(_analyticsEnabled === true) {
      SGAME.Analytics.onVLEDataReceived(getVLEData())
    }
  };
  var _togglePause = function() {
    if(typeof _togglePauseFunction === "function") {
      _togglePauseFunction()
    }
  };
  var _updateFlagsAndTracking = function() {
    var lo_ids = Object.keys(_settings["los"]);
    _nLOs = lo_ids.length;
    _nloshown = 0;
    _nshown = 0;
    _nlosuccess = 0;
    _nsuccess = 0;
    _los_can_be_shown = false;
    for(var i = 0;i < _nLOs;i++) {
      if(_settings["los"][lo_ids[i]]["shown"] === true) {
        _nloshown += 1;
        _nshown += _settings["los"][lo_ids[i]]["nshown"]
      }
      if(_settings["los"][lo_ids[i]]["successfully_consumed"] === true) {
        _nlosuccess += 1;
        _nsuccess += _settings["los"][lo_ids[i]]["nsuccess"]
      }
      if(_settings["los"][lo_ids[i]]["can_be_shown"] === true) {
        _los_can_be_shown = true
      }
    }
    var nLOsForTracking = _nLOs;
    if(_sequence_enabled === true) {
      if(_sequence_finished === true) {
        nLOsForTracking = _nloshown
      }else {
        nLOsForTracking = _nLOsForTrackingWhenSequence
      }
    }
    var progress_measure = 0;
    var completion_status = "incompleted";
    switch(_settings["game_settings"]["completion_status"]) {
      case "all_los":
        _settings["game_settings"]["completion_status_n"] = 100;
      case "percentage_los":
        var n_percentage_los_threshold = Math.min(100, Math.max(0, _settings["game_settings"]["completion_status_n"])) / 100;
        if(n_percentage_los_threshold <= 0 || nLOsForTracking <= 0) {
          progress_measure = 1
        }else {
          progress_measure = _nloshown / nLOsForTracking / n_percentage_los_threshold
        }
        break;
      case "n_los":
        var n_los_threshold = Math.min(_settings["game_settings"]["completion_status_n"], nLOsForTracking);
        if(n_los_threshold === 0) {
          progress_measure = 1
        }else {
          progress_measure = _nloshown / n_los_threshold
        }
        break;
      case "n_times":
        if(_settings["game_settings"]["completion_status_n"] <= 0) {
          progress_measure = 1
        }else {
          progress_measure = _nshown / _settings["game_settings"]["completion_status_n"]
        }
        break;
      case "onstart":
        progress_measure = 1;
        break;
      case "disabled":
      ;
      default:
        break
    }
    progress_measure = Math.max(Math.min(1, +progress_measure.toFixed(2)), 0);
    if(progress_measure === 1) {
      completion_status = "completed"
    }else {
      completion_status = "incompleted"
    }
    var score = 0;
    var success_status = "unknown";
    switch(_settings["game_settings"]["success_status"]) {
      case "all_los":
        _settings["game_settings"]["success_status_n"] = 100;
      case "percentage_los":
        var n_percentage_los_threshold = Math.min(100, Math.max(0, _settings["game_settings"]["success_status_n"])) / 100;
        if(n_percentage_los_threshold <= 0 || nLOsForTracking <= 0) {
          score = 1
        }else {
          score = _nlosuccess / nLOsForTracking / n_percentage_los_threshold
        }
        break;
      case "n_los":
        var n_los_threshold = Math.min(_settings["game_settings"]["success_status_n"], nLOsForTracking);
        if(n_los_threshold === 0) {
          score = 1
        }else {
          score = _nloshown / n_los_threshold
        }
        break;
      case "n_times":
        if(_settings["game_settings"]["success_status_n"] <= 0) {
          score = 1
        }else {
          score = _nsuccess / _settings["game_settings"]["success_status_n"]
        }
        break;
      case "oncompletion":
        score = progress_measure;
        break;
      case "onstart":
        score = 1;
        break;
      case "disabled":
      ;
      default:
        break
    }
    score = Math.max(Math.min(1, +score.toFixed(2)), 0);
    if(score === 1) {
      success_status = "passed"
    }else {
      success_status = "failed"
    }
    _tracking = {progress_measure:progress_measure, completion_status:completion_status, score:score, success_status:success_status};
    SGAME.Debugger.log("Tracking");
    SGAME.Debugger.log(_tracking);
    SGAME.Messenger.sendMessage({key:"tracking", value:_tracking})
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
    var nLOsForEnding = _nLOs;
    if(_sequence_enabled === true && _sequence_finished === true) {
      nLOsForEnding = _nloshown
    }
    switch(_settings["game_settings"]["completion_notification"]) {
      case "no_more_los":
        return _los_can_be_shown === false;
      case "all_los_consumed":
        return _nloshown >= nLOsForEnding;
      case "all_los_successfully_consumed":
        return _nlosuccess >= nLOsForEnding;
      case "completion_status":
        return _tracking["completion_status"] === "completed";
      case "success_status":
        return _tracking["success_status"] === "passed";
      case "never":
        return false;
      default:
        return false
    }
  };
  var _showFinalScreen = function(callback) {
    _final_screen_shown = true;
    if(_analyticsEnabled === true) {
      SGAME.Analytics.recordGameCompleted(_tracking)
    }
    SGAME.Fancybox.create({dialog:true, msg:_final_screen_text}, function() {
      if(typeof callback === "function") {
        callback(true)
      }
    })
  };
  var _selectLoFromCandidates = function(los_candidate) {
    var loSelected = undefined;
    switch(_settings["sequencing"]["approach"]) {
      case "linear_completion":
      ;
      case "linear_success":
      ;
      case "custom":
        loSelected = _selectLoFromCandidatesSequence(los_candidate);
        break;
      case "random":
      ;
      default:
        loSelected = _selectLoFromCandidatesRandom(los_candidate);
        break
    }
    return loSelected
  };
  var _selectLoFromCandidatesRandom = function(los_candidate) {
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
  var _selectLoFromCandidatesSequence = function(loCandidatesFromMapping) {
    var candidates;
    if(_sequence_enabled === true && _sequence_finished === false) {
      candidates = _getLoCandidatesFromSequecingRules(loCandidatesFromMapping)
    }else {
      candidates = loCandidatesFromMapping
    }
    return _selectLoFromCandidatesRandom(candidates)
  };
  var _getLoCandidatesFromSequecingRules = function(loCandidatesFromMapping) {
    var candidates = [];
    var candidates_ids = [];
    var lo_candidates_mapping_ids = [];
    for(var k = 0;k < loCandidatesFromMapping.length;k++) {
      lo_candidates_mapping_ids.push(loCandidatesFromMapping[k].id)
    }
    var group_ids = Object.keys(_settings["sequencing"]["sequence"]);
    for(var i = 0;i < group_ids.length;i++) {
      var group = _settings["sequencing"]["sequence"][group_ids[i]];
      if(group["can_be_shown"] === true) {
        for(var j = 0;j < group.los.length;j++) {
          if(lo_candidates_mapping_ids.indexOf(group.los[j]) !== -1) {
            if(candidates_ids.indexOf(group.los[j]) === -1) {
              candidates_ids.push(group.los[j]);
              candidates.push(_settings["los"][group.los[j]])
            }
          }
        }
      }
    }
    return candidates
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
      case "success_unless_damage":
        var event = _getEventMetadata(event_id);
        if(typeof event !== "undefined" && event.type === "damage") {
          return false
        }
        return true;
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
  SGAME.Debugger.init(false);
  return{init:init, loadSettings:loadSettings, triggerLO:triggerLO, showLO:showLO, showRandomLO:showRandomLO, closeLO:closeLO, getSettings:getSettings, losCanBeShown:losCanBeShown, successWhenNoLOs:successWhenNoLOs, onConnectedToVLE:onConnectedToVLE, getVLEData:getVLEData, setVLEData:setVLEData}
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

