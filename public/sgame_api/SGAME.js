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
SGAME.VERSION = "1.0.0";
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
SGAME.Sequencing = function() {
  var _sequencingApproach;
  var supportedGroupRequirements = ["completion", "success"];
  var init = function(seq_settings) {
    _sequencingApproach = seq_settings["approach"]
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
      var group = _validateGroupConditions(groups[group_ids[i]], group_ids);
      if(group !== false) {
        groups[group_ids[i]] = group
      }else {
        delete groups[group_ids[i]]
      }
    }
    var nNewGroups = Object.keys(groups).length;
    if(nNewGroups === nGroups) {
      return groups
    }else {
      return _validateGroupsConditions(groups)
    }
  };
  var _validateGroupConditions = function(group, groupIds) {
    if(typeof group.conditions === "undefined") {
      return group
    }
    if(typeof group.conditions !== "object") {
      return false
    }
    if(group.conditions.length === 0) {
      delete group.conditions;
      return group
    }
    var validConditions = [];
    for(var i = 0;i < group.conditions.length;i++) {
      var condition = group.conditions[i];
      if(groupIds.indexOf(condition.group + "") !== -1) {
        if(supportedGroupRequirements.indexOf(condition.requirement) !== -1) {
          validConditions.push(condition)
        }
      }
    }
    group.conditions = validConditions;
    if(group.conditions.length === 0) {
      return false
    }
    return group
  };
  var updateGroupsTracking = function(lo, groups, los) {
    for(var i = 0;i < lo.groups.length;i++) {
      var group = groups[lo.groups[i] + ""];
      groups[lo.groups[i] + ""] = _updateGroupTracking(group, los)
    }
    var nLockedGroups = 0;
    var group_ids = Object.keys(groups);
    for(var j = 0;j < group_ids.length;j++) {
      var ogroup = groups[group_ids[j]];
      if(ogroup.can_be_shown === false) {
        nLockedGroups = nLockedGroups + 1;
        if(ogroup.shown === false && ogroup.succesfully_consumed === false) {
          groups[group_ids[j]] = _updateGroupUnlock(ogroup, groups);
          if(groups[group_ids[j]].can_be_shown === true) {
            los = _changeCanBeShownForLOsInGroup(groups[group_ids[j]], los, true);
            nLockedGroups = nLockedGroups - 1
          }
        }
      }
    }
    for(var k = 0;k < lo.groups.length;k++) {
      var ogroup = groups[lo.groups[k] + ""];
      if(ogroup.can_be_shown === true) {
        groups[lo.groups[k] + ""] = _updateGroupLock(ogroup, groups);
        if(groups[lo.groups[k] + ""].can_be_shown === false) {
          los = _changeCanBeShownForLOsInGroup(groups[lo.groups[k] + ""], los, false);
          nLockedGroups = nLockedGroups + 1
        }
      }
    }
    var finished = nLockedGroups === group_ids.length;
    if(finished) {
      los = _unlockLOsWithoutGroup(los)
    }
    return{"groups":groups, "los":los, "finished":finished}
  };
  var _updateGroupTracking = function(group, los) {
    if((group.shown && group.succesfully_consumed) === true) {
      return group
    }
    var gShown = true;
    var gSuccess = true;
    for(var i = 0;i < group.los.length;i++) {
      var lo = los[group.los[i]];
      gShown = gShown && lo.shown === true;
      gSuccess = gSuccess && lo.succesfully_consumed === true
    }
    group.shown = gShown;
    group.succesfully_consumed = gSuccess;
    return group
  };
  var _updateGroupUnlock = function(group, groups) {
    if(typeof group.conditions === "undefined") {
      return group
    }
    var unlock = true;
    for(var k = 0;k < group.conditions.length;k++) {
      if(group.conditions[k].met === false) {
        switch(group.conditions[k].requirement) {
          case "completion":
            group.conditions[k].met = groups[group.conditions[k].group + ""].shown === true;
            break;
          case "success":
            group.conditions[k].met = groups[group.conditions[k].group + ""].succesfully_consumed === true;
            break
        }
        unlock = unlock && group.conditions[k].met;
        if(unlock === false) {
          break
        }
      }
    }
    group.can_be_shown = unlock;
    return group
  };
  var _updateGroupLock = function(group, groups) {
    var lock = _getLockForGroup(group, groups);
    group.can_be_shown = lock === false;
    return group
  };
  var _getLockForGroup = function(group, groups) {
    var group_ids = Object.keys(groups);
    var nConditionsMet = 0;
    for(var j = 0;j < group_ids.length;j++) {
      var ogroup = groups[group_ids[j]];
      if(ogroup.can_be_shown === false && (ogroup.id != group.id && typeof ogroup.conditions !== "undefined")) {
        for(var k = 0;k < ogroup.conditions.length;k++) {
          if(ogroup.conditions[k].group == group.id) {
            if(ogroup.conditions[k].met === false) {
              return false
            }
            nConditionsMet = nConditionsMet + 1
          }
        }
      }
    }
    if(nConditionsMet > 0) {
      return true
    }else {
      switch(_sequencingApproach) {
        case "linear_completion":
          return group.shown;
        case "linear_success":
          return group.succesfully_consumed;
        case "custom":
        ;
        default:
          return group.shown && group.succesfully_consumed;
          break
      }
    }
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
  return{init:init, validateSequence:validateSequence, updateGroupsTracking:updateGroupsTracking}
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
  var _sequence_finished = false;
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
  var supportedCompletionNotification = ["no_more_los", "all_los_consumed", "all_los_succesfully_consumed", "completion_status", "success_status", "never"];
  var supportedBehaviourWhenNoMoreLOs = ["success", "failure", "success_unless_damage", "failure_unless_blocking"];
  var _los_can_be_shown = false;
  var _nLOs = 0;
  var _nloshown = 0;
  var _nshown = 0;
  var _nlosuccess = 0;
  var _nsuccess = 0;
  var _final_screen_shown = false;
  var _lastLoTimeStamp = undefined;
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
        _settings["los"][lo_ids[i]]["succesfully_consumed"] = false;
        _settings["los"][lo_ids[i]]["nsuccess"] = 0;
        _settings["los"][lo_ids[i]]["acts_as_asset"] = _settings["los"][lo_ids[i]]["scorm_type"] === "asset" || _settings["los"][lo_ids[i]]["scorm_type"] === "sco" && _settings["los"][lo_ids[i]]["report_data"] === false;
        _los_can_be_shown = true
      }
    }
    if(_settings["sequencing"]["approach"] !== "random") {
      var validatedSequence = SGAME.Sequencing.validateSequence(_settings["sequencing"]["sequence"], _settings["los"]);
      if(validatedSequence === false) {
        _settings["sequencing"]["approach"] = "random"
      }else {
        _settings["sequencing"]["sequence"] = validatedSequence
      }
    }
    if(_settings["sequencing"]["approach"] === "random") {
      delete _settings["sequencing"]["sequence"]
    }
    if(typeof _settings["sequencing"]["sequence"] === "object") {
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
        var group = _settings["sequencing"]["sequence"][group_ids[j]];
        group["can_be_shown"] = typeof group.conditions === "undefined" || group.conditions.length === 0;
        group["shown"] = false;
        group["succesfully_consumed"] = false;
        if(typeof group.conditions !== "undefined") {
          for(var k = 0;k < group.conditions.length;k++) {
            group.conditions[k].met = false
          }
        }
        _settings["sequencing"]["sequence"][group_ids[j]] = group;
        for(var l = 0;l < group.los.length;l++) {
          _settings["los"][group.los[l]].groups.push(group.id);
          _settings["los"][group.los[l]]["can_be_shown"] = group["can_be_shown"] === true;
          if(_settings["los"][group.los[l]]["can_be_shown"] === true) {
            _los_can_be_shown = true
          }
        }
      }
    }
    SGAME.Sequencing.init(_settings["sequencing"])
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
    SGAME.Fancybox.create({lo:lo}, function(report) {
      if(_settings["los"][lo["id"]]["succesfully_consumed"] !== true) {
        _settings["los"][lo["id"]]["succesfully_consumed"] = report.success
      }
      if(report.success === true) {
        _settings["los"][lo["id"]]["nsuccess"] += 1
      }
      if(_settings["sequencing"]["approach"] !== "random" && _sequence_finished === false) {
        var output = SGAME.Sequencing.updateGroupsTracking(_settings["los"][lo["id"]], _settings["sequencing"]["sequence"], _settings["los"]);
        _settings["sequencing"]["sequence"] = output.groups;
        _settings["los"] = output.los;
        if(output.finished) {
          _sequence_finished = true
        }
      }
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
      _updateFlagsAndTracking();
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
    return _vle_data
  };
  var _togglePause = function() {
    if(typeof _togglePauseFunction === "function") {
      _togglePauseFunction()
    }
  };
  var _updateFlagsAndTracking = function() {
    var lo_ids = Object.keys(_settings["los"]);
    var nLOs = lo_ids.length;
    _nloshown = 0;
    _nshown = 0;
    _nlosuccess = 0;
    _nsuccess = 0;
    _los_can_be_shown = false;
    for(var i = 0;i < nLOs;i++) {
      if(_settings["los"][lo_ids[i]]["shown"] === true) {
        _nloshown += 1;
        _nshown += _settings["los"][lo_ids[i]]["nshown"]
      }
      if(_settings["los"][lo_ids[i]]["succesfully_consumed"] === true) {
        _nlosuccess += 1;
        _nsuccess += _settings["los"][lo_ids[i]]["nsuccess"]
      }
      if(_settings["los"][lo_ids[i]]["can_be_shown"] === true) {
        _los_can_be_shown = true
      }
    }
    var progress_measure = 0;
    var completion_status = "incompleted";
    switch(_settings["game_settings"]["completion_status"]) {
      case "all_los":
        _settings["game_settings"]["completion_status_n"] = 100;
      case "percentage_los":
        var n_percentage_los_threshold = Math.min(100, Math.max(0, _settings["game_settings"]["completion_status_n"])) / 100;
        if(n_percentage_los_threshold <= 0 || _nLOs <= 0) {
          progress_measure = 1
        }else {
          progress_measure = _nloshown / _nLOs / n_percentage_los_threshold
        }
        break;
      case "n_los":
        var n_los_threshold = Math.min(_settings["game_settings"]["completion_status_n"], _nLOs);
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
        if(n_percentage_los_threshold <= 0 || _nLOs <= 0) {
          score = 1
        }else {
          score = _nlosuccess / _nLOs / n_percentage_los_threshold
        }
        break;
      case "n_los":
        var n_los_threshold = Math.min(_settings["game_settings"]["success_status_n"], _nLOs);
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
    switch(_settings["game_settings"]["completion_notification"]) {
      case "no_more_los":
        return _los_can_be_shown === false;
      case "all_los_consumed":
        return _nloshown >= _nLOs;
      case "all_los_succesfully_consumed":
        return _nlosuccess >= _nLOs;
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
    if(_sequence_finished === false) {
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
    for(var j = 0;j < loCandidatesFromMapping.length;j++) {
      lo_candidates_mapping_ids.push(loCandidatesFromMapping[j].id)
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
  var _loadInitialSettings = function() {
    if(_settings_loaded === false) {
      _loadSettings({})
    }
  };
  SGAME.Debugger.init(false);
  _loadInitialSettings();
  SGAME.Messenger.init();
  return{init:init, loadSettings:loadSettings, triggerLO:triggerLO, showLO:showLO, showRandomLO:showRandomLO, closeLO:closeLO, getSettings:getSettings, losCanBeShown:losCanBeShown, successWhenNoLOs:successWhenNoLOs, onConnectedToVLE:onConnectedToVLE, getVLEData:getVLEData, setVLEData:setVLEData}
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

