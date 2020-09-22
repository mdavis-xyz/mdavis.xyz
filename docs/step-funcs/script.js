function byId(id){
  return document.getElementById(id);
}

// set up events for validating/warning about user input
// and triggering evaluations
window.addEventListener("load", function(){
  console.log("Setting up event listeners");
  // Input field
  setupJsonWarning("Input", "InvalidInputWarning");
  setupEval("Input");

  // InputPath field
  setupEval("InputPath");
  setupEval("InputPathEnabled");
  setupNullWarning("InputPath", "NullInputPathWarning")
  setupDollarStartWarning("InputPath", "InputPathStartDollarWarn");
  setupToggleHide("InputPathEnabled", "InputPathExtras");
  setupIntrinsicFuncWarn("InputPath", "InputPathFuncWarn");

  // Parameters
  setupEval("Parameters");
  setupEval("ParametersEnabled");
  setupJsonWarning("Parameters", "InvalidParametersWarning");
  setupToggleHide("ParametersEnabled", "ParametersExtras");
  setupNullWarning("Parameters", "NullParametersWarning")
  setupIntrinsicFuncWarn("Parameters", "ParametersFuncWarn");

  // Result
  setupEval("Result");
  setupEval("ResultEnabled");
  setupJsonWarning("Result", "InvalidResultWarning");
  setupToggleHide("ResultEnabled", "ResultExtras", "WhenNoResult");
  setupNullWarning("Result", "NullResultWarning");
  setupDollarWarning("Result", "ResultDollarWarning");
  setupIntrinsicFuncWarn("Result", "ResultFuncWarn");

  // ResultSelector
  setupEval("ResultSelector");
  setupEval("ResultSelectorEnabled");
  setupJsonWarning("ResultSelector", "InvalidResultSelectorWarning");
  setupToggleHide("ResultSelectorEnabled", "ResultSelectorExtras");
  setupNullWarning("ResultSelector", "NullResultSelectorWarning");
  setupIntrinsicFuncWarn("ResultSelector", "ResultSelectorFuncWarn");

  // ResultPath
  setupEval("ResultPath");
  setupEval("ResultPathEnabled");
  setupToggleHide("ResultPathEnabled", "ResultPathExtras");
  setupNullWarning("ResultPath", "NullResultPathWarning");
  setupIntrinsicFuncWarn("ResultPath", "ResultPathFuncWarn");
  setupDollarStartWarning("ResultPath", "ResultPathStartDollarWarn");

  // OutputPath
  setupEval("OutputPath");
  setupEval("OutputPathEnabled");
  setupToggleHide("OutputPathEnabled", "OutputPathExtras");
  setupNullWarning("OutputPath", "NullOutputPathWarning");
  setupIntrinsicFuncWarn("OutputPath", "OutputPathFuncWarn");
  setupDollarStartWarning("OutputPath", "OutputPathStartDollarWarn");

  console.log("Event listener setup complete");

});


// set up event handlers
// so when you change the tickbox/text field with id,
// the evaluation is automatically run
setupEval = function(id){
  byId(id).addEventListener("input", evalAll);
}

// w is the ID of a DOM element to hide/show
// if the innerText of the el with id txt is invalid JSON
setupJsonWarning = function(txt_id, w_id){
  byId(txt_id).addEventListener("input", function(){
    v = byId(txt_id).innerText;
    w_el = byId(w_id);
    try {
      d = JSON.parse(v);
      w_el.style.display = "none";
    }catch(e){
      w_el.style.display = "block";
    }
  })
}

// w is the ID of a DOM element to hide/show
// if the innerText of the el with id txt is "null"
setupNullWarning = function(txt_id, w_id){
  byId(txt_id).addEventListener("input", function(){
    w_el = byId(w_id)
    if (byId(txt_id).innerText.trim() === "null"){
      w_el.style.display = "block";
    }else{
      w_el.style.display = "none";
    };
  });
}

// w is the ID of a DOM element to hide/show
// if the innerText of the el with id txt
// contains "$"
setupDollarWarning = function(txt_id, w_id){
  byId(txt_id).addEventListener("input", function(){
    val = byId(txt_id).innerText.trim();
    w_el = byId(w_id);
    if (val.startsWith('$')){
      w_el.style.display = "block";
    }else if(val == "null"){
      // special case
      // the next else branch doesn't handle this correctly
      // not sure why
      w_el.style.display = "none";
    }else{
      // what if the Result is like {"a.$": "$"}
      // to check this, apply JSONPath recursively
      // and check whether the result is different to the input (or undefined)
      try {
        r = JSON.parse(val);
      }catch(e){
        console.log("I think the result is not valid JSON");
        w_el.style.display = "none";
        // there's an invalid JSON warning handled elsewhere
        // this function is just about $
        return;
      }
      try {
        after = recursivePath(r, {"fake-random-data-mdavis-xyz": 123098})
        // need to parse val again
        // since recursivePath modifies it
        r = JSON.parse(val);

        // checking if after != r is tricky
        // in Javascript, {} != {}

        if ((after == undefined) || (JSON.stringify(after) != JSON.stringify(r))){
          console.log("I think result includes .$");
          w_el.style.display = "block";
        }else{
          console.log("I think the result is valid json and does not include .$")
          w_el.style.display = "none";
        }
      }catch(e){
        // probably some kind of .$ inside which isn't correct
        // so show the .$ warning
        w_el.style.display = "block";
      }
    }
  })
}

// set up event listeners
// to hide/show warning about
// how a field must start with a $
// (unless it equals $)
setupDollarStartWarning = function(txt_id, w_id){
  byId(txt_id).addEventListener("input", function(){
    w_el = byId(w_id);
    v = byId(txt_id).innerText.trim();
    if (v.startsWith("$") || (v == "null")){
      w_el.style.display = "none";
    }else{
      w_el.style.display = "block";
    }
  })
}

// set up event handlers
// so when you tick/untick the "enable x" box,
// the relevant fields are shown/hidden
// extras is only shown when the box is ticked
// when_none is optional, shown only when the box is unticked
setupToggleHide = function(checkbox_id, extras_id, when_none){
  byId(checkbox_id).addEventListener("input", function(){
    if (byId(checkbox_id).checked){
      console.log(`showing ${extras_id}`);
      // show
      byId(extras_id).style.display = "block";
      if (when_none != undefined){
        byId(when_none).style.display = "none";
      }
    }else{
      // hide
      console.log(`hiding ${extras_id}`);
      byId(extras_id).style.display = "none";
      if (when_none != undefined){
        byId(when_none).style.display = "block";
      }
    }
  });
  evalAll();
}

// sets up event handlers
// to show warnings if user tries to use an intrinsic function
// which we don't support here
setupIntrinsicFuncWarn = function(txt_id, warn_id){
  byId(txt_id).addEventListener("input", function(){
    // https://states-language.net/spec.html#appendix-b
    intrinsic_funcs = ["States.Format", "States.StringToJson", "States.JsonToString", "States.Array"];
    v = byId(txt_id).innerText.toLowerCase();
    w_el = byId(warn_id);
    in_val = function(f){
      return (v.toLowerCase().includes(f.toLowerCase()))
    };
    if (intrinsic_funcs.some(in_val)){
      w_el.style.display = "block";
    }else{
      w_el.style.display = "none";
    }
  })
}




// return [obj, err]
// if valid input path and valid input
// obj is a dict/list/obj after the InputPath is applied
// or err is a string of an error to show to the user
function evalInputPath(){
  inputEl = byId("Input");
  try {
    inputObj = JSON.parse(inputEl.innerText);
  } catch (e) {
    console.log(e);
    console.log("Input probably not valid JSON");
    return [undefined, "Input is invalid JSON"];
  };

  pathVal = byId("InputPath").innerText;
  if (! byId("InputPathEnabled").checked){
    console.log("Skipping InputPath")
    obj = inputObj; // no InputPath
  }else if (pathVal.trim() === "null") {
    // special meaning in step functions
    obj = {};
  } else {
    try {
      console.log(`Applying jsonPath(${inputObj}, "${pathVal}")`);
      obj = applyPath(inputObj, pathVal);
    } catch(e) {
      console.log(e)
      return [undefined, "Invalid InputPath"];
    }
  }
  if (obj == undefined){
      return [undefined, "Invalid InputPath"];
  }

  console.log("InputPath applied successfully");
  return [obj, undefined];
}

// returns [afterParametersObj, err2]
// input obj is the object after InputPath
// output object is after parameters have been applied
// input err is the error from any previous path (e.g. InputPath)
function evalParameters(afterInputPathobj, err){
    if (err){
      return [undefined, err];
    }
    try {
      paramsObj = JSON.parse(byId("Parameters").innerText);
    } catch (e) {
      console.log(e);
      return [undefined, "Parameters is invalid json"];
    };

    if (! byId("ParametersEnabled").checked){
      console.log("Skipping Parameters");
          }else if (paramsObj == null) {
      // special meaning in step functions
      obj = {};
    }else {
      try {
        obj = recursivePath(paramsObj, obj);
      } catch(e) {
        console.log(e);
        return [undefined, "Invalid Parameters"];
      }
    }
    return [obj, undefined];
}

function evalTheResult(afterParametersObj, err){
  if (byId("ResultEnabled").checked){
    // use the result
    // even if prior steps failed
    try {
      obj = JSON.parse(byId("Result").innerText);
      return [obj, undefined];
    } catch (e) {
      console.log(e);
      return [undefined, "Result is invalid JSON"];
    };
  }else if (err){
    return [undefined, err]
  }else{
    return [afterParametersObj, err];
  }
}

function evalResultPath(resultObj, err){
  if (err){
    return [null, err];
  }
  if (byId("ResultPathEnabled").checked){
    try{
      inputObj = JSON.parse(byId("Input").innerText);
    }catch(e){
      // if input isn't JSON, this function shouldn't be called anyway
      console.log(e);
      return [null, "original state input is invalid JSON"];
    }
    path = byId("ResultPath").innerText;
    if (path.trim() === "null"){
      // ResultPath=null
      // means discard the result
      return [inputObj, null]
    }
    try {
      obj = insertAtPath(inputObj, resultObj, path)
    }catch(e){
      err = `unable to apply ResultPath: ${e}`;
      byId("AfterResultPath").innerText = err;
      return [null, err];
    }
    return [obj, null];
  }else{
    return [resultObj, err];
  }
}

function evalResultSelector(afterResult, err){
    if (err){
      return [undefined, err];
    }
    try {
      resultSelectorObj = JSON.parse(byId("ResultSelector").innerText);
    } catch (e) {
      console.log(e);
      return [undefined, "ResultSelector is invalid json"];
    };

    if (! byId("ResultSelectorEnabled").checked){
      console.log("Skipping ResultSelector");
      return [afterResult, undefined];
    }else if (resultSelectorObj == null) {
      // special meaning in step functions
      obj = {};
    }else {
      try {
        obj = recursivePath(resultSelectorObj, obj);
      } catch(e) {
        console.log(e);
        return [undefined, "Invalid ResultSelector"];
      }
    }
    return [obj, undefined];
}


function evalOutputPath(afterResultPathObj, err){
  if (err){
    return [undefined, err];
  }else{
    pathVal = byId("OutputPath").innerText;
    if (! byId("OutputPathEnabled").checked){
      console.log("Skipping InputPath")
      return [afterResultPathObj, undefined];
    }else if (pathVal.trim() === "null") {
      // special meaning in step functions
      obj = {};
    } else {
      try {
        obj = applyPath(afterResultPathObj, pathVal);
      } catch(e) {
        console.log(e)
        return [undefined, "Invalid OutputPath"];
      }
    }
    if (obj == undefined){
        return [undefined, "Invalid OutputPath"];
    }
    return [obj, undefined];
  }

}


function evalAll(){
  // Apply InputPath
  [obj, err] = evalInputPath();
  byId("AfterInputPath").innerText = err ? "Error: " + err : JSON.stringify(obj, null, 4);

  // apply Parameters
  [obj, err] = evalParameters(obj, err);
  byId("AfterParameters").innerText = err ? "Error: " + err : JSON.stringify(obj, null, 4);

  // apply result
  [obj, err] = evalTheResult(obj, err);
  // there's no field to show an error/intermediate value in

  // apply ResultSelector
  [obj, err] = evalResultSelector(obj, err);
  byId("AfterResultSelector").innerText = err ? "Error: " + err : JSON.stringify(obj, null, 4);

  // apply ResultPath
  // TODO
  [obj, err] = evalResultPath(obj, err);
  byId("AfterResultPath").innerText = err ? "Error: " + err : JSON.stringify(obj, null, 4);

  // apply OutputPath
  [obj, err] = evalOutputPath(obj, err);
  byId("AfterOutputPath").innerText = err ? "Error: " + err : JSON.stringify(obj, null, 4);

}

// example:
// obj = {"a": "$[1].a", "b": "$[2]"}
// dollar = [0, {"a": 123}, []]
// return val {"a": 123, "b": []}
function recursivePath(obj, dollar) {
  if (obj == null) {
    return obj;
  } else if (obj.constructor == Array){
    // it's a list
    // [recursivePath(x, dollar) for x in obj]
    return obj.map((x) => {
      return recursivePath(x, dollar)
    })
  } else if (isStr(obj)) {
    return obj;
  } else if (typeof obj == "number"){
    return obj;
  } else {
    console.debug(`I think ${obj} is a dict`);
    // the only thing left is a dictionary
    // (There are probably other things in theory,
    //  but not right after JSON.parse)
    for (const [key, value] of Object.entries(obj)) {
      if (isStr(key) && key.endsWith(".$")){
        new_key = key.replace(/\.\$$/gi, "");
        console.log(`Going to replace ${key}=${value}`);
        if (! isStr(value)){
          console.log(`Value ${value} for ${key} should be a string`);
          throw "Value ${value} for ${key} should be a string";
        } else{
          new_value = applyPath(dollar, value);
          if (new_value == undefined){
            console.log("JSONPath recursive failed for one value ${key}=${value}, so fail for the lot");
            throw "Failed to evaluate path ${value} for ${key}";
          }
        }
        console.log(`Changing ${key}=${value} to ${new_key}=${new_value}`);
        obj[new_key] = new_value;
        delete obj[key];
      } else {
        obj[key] = recursivePath(value, dollar);
      }
    };
    return obj;
  }
}

// applies the JSONPath path to the Object
// note that Step Functions use slightly different behavior
// to the js lib we're using
function applyPath(dollar, path){
  if (path === "$"){
    // jsonPath(x, "$") does not just return "$"
    // not sure why
    return dollar;
  }else{
    result = jsonPath(dollar, path);
    if ((result == undefined) || (result == false)){
      console.log(`Probably failed applying ${path} to ${dollar}`);
    }
    return result;
  }
}

// ResultPath is used to replace/add a certain value (the result)
// to a path within the input
// The existing JSONPath module doesn't do this
//
// note that you can have ResultPath=$[1] for ["a", "b"], but not for ["a"]
// and you can have ResultPath=$.a.b for {}, so both a and b will be added
function insertAtPath(fullValue, newValue, path){
  path = path.trim();
  if (! path.startsWith('$')){
    console.log(`Bad path: ${path}`);
    throw "Path must start with $"
  }else{
    path = path.substr(1); // drop the $
    return insertAtPathRec(fullValue, newValue, path);
  }
}

// by now, path is missing the starting "$"
function insertAtPathRec(fullValue, newValue, path){

  // this regex is to check if path starts with an index
  // e.g. $[123] (without the $)
  // assume a non-negative integer
  // e.g. not $[-1] or $[$.a]
  // because Step Functions doesn't do that
  square_re = /^\[([0-9]+)\](.*?)$/

  // this regex is to check for $.abc
  // note that $.a b is valid. i.e. keys can have spaces
  dot_re = /^\.([^\.\[]+)(.*?)$/

  if (path == ""){
    return newValue;
  }else if (square_re.test(path)){
    [_, index, remaining_path] = square_re.exec(path)
    try {
      index = parseInt(index);
    } catch(e){
      throw `[${index}] is not a valid index, must be a non-negative integer`
    }
    // as far as I can tell,
    // using ResultPath with []
    // the list must already exist, and that index must already exist
    if (! (fullValue instanceof Array)) {
      throw `Unable to apply [${index}] because a list doesn't exist there already`;
    }else if (fullValue.length <= index){
      throw `Unable to apply [${index}] because the existing list isn't long enough. Step Funtions won't extend the list.`;
    }
    fullValue[index] = insertAtPathRec(fullValue[index], newValue, remaining_path);
    return fullValue;
  }else if (dot_re.test(path)){
    [_, key, remaining_path] = dot_re.exec(path);
    if (fullValue instanceof Array) {
      throw `Unable to apply .${key} because the data at that point is a list`;
    }else if (!(typeof fullValue === "object")){
      throw `Unable to apply .${key} because the data at that point exists and is not a dictionary. Step Functions won't replace this with a new dict`;
    }else if (! fullValue.hasOwnProperty(key)){
      // ResultPath should create this key
      // but check whether any later segment of the path
      // is an last
      // e.g. $.a.b[1] for {"a": {}}
      if (path.indexOf("[") > -1){
        throw `Key ${key} doesn't exist, would be created, but subsequent path includes index, Step Functions won't create a new list in ResultPath`;
      }
      // now it doesn't matter what we pass to the recursive call
      fullValue[key] = insertAtPathRec({}, newValue, remaining_path)
    }else{
      fullValue[key] = insertAtPathRec(fullValue[key], newValue, remaining_path);
    }
    return fullValue;
  }else{
    throw `Unsure how to parse the remaining path: ${path}`;
  }



}

// returns a boolean
// is x of type string
function isStr(x){
  return (typeof x === 'string' || x instanceof String);
}
