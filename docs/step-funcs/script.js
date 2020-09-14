// set up events for validating/warning about user input
// and triggering evaluations
window.addEventListener("load", function(){
  console.log("Setting up event listeners");
  // Input field
  setupJsonWarning("Input", "InvalidInputWarning");
  setupEval("Input");

  // InputPath field
  setupEval("InputPath");
  setupNullWarning("InputPath", "NullInputPathWarning")
  setupDollarStartWarning("InputPath", "InputPathStartDollarWarn");
  setupToggleHide("InputPathEnabled", "InputPathExtras");
  setupIntrinsicFuncWarn("InputPath", "InputPathFuncWarn");

  // Parameters
  setupEval("Parameters");
  setupJsonWarning("Parameters", "InvalidParametersWarning");
  setupToggleHide("ParametersEnabled", "ParametersExtras");
  setupNullWarning("Parameters", "NullParametersWarning")
  setupIntrinsicFuncWarn("Parameters", "ParametersFuncWarn");

  // Result
  setupEval("Result");
  setupJsonWarning("Result", "InvalidResultWarning");
  setupToggleHide("ResultEnabled", "ResultExtras", "WhenNoResult");
  setupNullWarning("Result", "NullResultWarning");
  setupDollarWarning("Result", "ResultDollarWarning");
  setupIntrinsicFuncWarn("Result", "ResultFuncWarn");

  // ResultSelector
  setupEval("ResultSelector");
  setupJsonWarning("ResultSelector", "InvalidResultSelectorWarning");
  setupToggleHide("ResultSelectorEnabled", "ResultSelectorExtras");
  setupNullWarning("ResultSelector", "NullResultSelectorWarning");
  setupIntrinsicFuncWarn("ResultSelector", "ResultSelectorFuncWarn");

  // ResultPath
  setupEval("ResultPath");
  setupToggleHide("ResultPathEnabled", "ResultPathExtras");
  setupNullWarning("ResultPath", "NullResultPathWarning");
  setupIntrinsicFuncWarn("ResultPath", "ResultPathFuncWarn");
  setupDollarStartWarning("ResultPath", "ResultPathStartDollarWarn");

  // OutputPath
  setupEval("OutputPath");
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
  document.getElementById(id).addEventListener("input", evalAll);
}

// w is the ID of a DOM element to hide/show
// if the innerText of the el with id txt is invalid JSON
setupJsonWarning = function(txt_id, w_id){
  document.getElementById(txt_id).addEventListener("input", function(){
    v = document.getElementById(txt_id).innerText;
    w_el = document.getElementById(w_id);
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
  document.getElementById(txt_id).addEventListener("input", function(){
    w_el = document.getElementById(w_id)
    if (document.getElementById(txt_id).innerText.trim() === "null"){
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
  document.getElementById(txt_id).addEventListener("input", function(){
    val = document.getElementById(txt_id).innerText.trim();
    w_el = document.getElementById(w_id);
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
        console.log("I think the result is not valid JSON");
        w_el.style.display = "none";
        // there's an invalid JSON warning handled elsewhere
        // this function is just about $
      }
    }
  })
}

// set up event listeners
// to hide/show warning about
// how a field must start with a $
// (unless it equals $)
setupDollarStartWarning = function(txt_id, w_id){
  document.getElementById(txt_id).addEventListener("input", function(){
    w_el = document.getElementById(w_id);
    v = document.getElementById(txt_id).innerText.trim();
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
  document.getElementById(checkbox_id).addEventListener("input", function(){
    if (document.getElementById(checkbox_id).checked){
      console.log(`showing ${extras_id}`);
      // show
      document.getElementById(extras_id).style.display = "block";
      if (when_none != undefined){
        document.getElementById(when_none).style.display = "none";
      }
    }else{
      // hide
      console.log(`hiding ${extras_id}`);
      document.getElementById(extras_id).style.display = "none";
      if (when_none != undefined){
        document.getElementById(when_none).style.display = "block";
      }
    }
  });
  evalAll();
}

// sets up event handlers
// to show warnings if user tries to use an intrinsic function
// which we don't support here
setupIntrinsicFuncWarn = function(txt_id, warn_id){
  document.getElementById(txt_id).addEventListener("input", function(){
    // https://states-language.net/spec.html#appendix-b
    intrinsic_funcs = ["States.Format", "States.StringToJson", "States.JsonToString", "States.Array"];
    v = document.getElementById(txt_id).innerText.toLowerCase();
    w_el = document.getElementById(warn_id);
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


function evalAll(){
  // // Step 1: Check State Input data is valid JSON
  // inputEl = document.getElementById("Input");
  // warnEl = document.getElementById("InvalidInputWarning")
  // try {
  //   inputObj = JSON.parse(inputEl.innerText);
  // } catch (e) {
  //   console.log(e);
  //   console.log("Input probably not valid JSON");
  //   warnEl.style.display = "block";
  //   inputEl.classList.add("invalidInput");
  //   document.getElementById("AfterInputPath").innerText = "Error: State Input Payload is not valid JSON";
  //   document.getElementById("AfterParameters").innerText = "Error: State Input Payload is not valid JSON";
  //   // TODO: make all subsequent fields say error
  //   return;
  // };
  //
  // // input is valid JSON
  // // hide that warning
  // console.log("Input is valid JSON");
  // warnEl.style.display = "none";
  // inputEl.classList.remove("invalidInput");
  //
  // // step 2, apply InputPath
  // inputPathVal = document.getElementById("InputPath").innerText;
  // if (inputPathVal.trim() === "null") {
  //   // special meaning in step functions
  //   afterInputPathObj = {};
  // } else {
  //   try {
  //     console.log(`Applying jsonPath(${inputObj}, "${inputPathVal}")`);
  //     afterInputPathObj = applyPath(inputObj, inputPathVal);
  //   } catch(e) {
  //     console.log(resultObj);
  //     console.log("Failed to apply InputPath")
  //     document.getElementById("AfterParameters").innerText = "Error applying fieldId earlier";
  //     return;
  //   }
  // }
  // console.log(afterInputPathObj);
  // document.getElementById("AfterInputPath").innerText = JSON.stringify(afterInputPathObj, null, 4);
  // console.log("InputPath applied successfully");
  //
  // // step 3: apply Parameters
  // if (document.getElementById("NoParameters").checked) {
  //   // no Parameters field
  //   // so just pass through whatever happened after InputPath
  //   document.getElementById("AfterParameters").innerText = document.getElementById("AfterInputPath").innerText;
  //   afterParametersObj = afterInputPathObj;
  // }else if (document.getElementById("ParametersWith").checked){
  //   parametersVal = document.getElementById("Parameters").innerText;
  //   try {
  //     afterParametersObj = applyPath(afterInputPathObj, parametersVal);
  //   } catch (e) {
  //     console.log(e);
  //     console.log("Failed to apply parameters");
  //     document.getElementById("AfterParameters").innerText = "Error applying Parameters field";
  //     // TODO: set subsequent fields to errors too
  //     return;
  //   }
  // } else {
  //   console.log("Complex parameters evalutation");
  //   try {
  //     parametersObj = JSON.parse(document.getElementById("Parameters").innerText);
  //   } catch (e) {
  //     console.log(e);
  //     console.log("Parameters is not valid JSON");
  //     document.getElementById("AfterParameters").innerText = "Parameters is not valid JSON";
  //     // warnings and styles managed in other function
  //     // TODO: set subsequent fields to show errors
  //     return;
  //   }
  //   try {
  //     afterParametersObj = recursivePath(parametersObj, afterInputPathObj);
  //   } catch(e) {
  //     console.log(e);
  //     console.error("failed to apply JSONPath Parameters recursively");
  //     document.getElementById("AfterParameters").innerText = "Failed to evaluate Parameters as JSONPath";
  //     // TODO: set subsequent fields to errors
  //     return;
  //   }
  // }
  // document.getElementById("AfterParameters").innerText = JSON.stringify(afterParametersObj, null, 4);
  //
  // // step 4: apply Result
  // if (document.getElementById("NoResult").checked) {
  //   afterResultObj = afterParametersObj;
  // }else if (document.getElementById("ResultWithout").checked){
  //   try {
  //     afterResultObj = JSON.parse(document.getElementById("Result").innerText);
  //   } catch(e) {
  //     // set subsequent fields to errors
  //     return;
  //   }
  // }
  //
  // // step 5: Apply ResultSelector
  // if (document.getElementById("NoResultSelector").checked) {
  //   afterResultSelectorObj = afterResultObj;
  // }else if (document.getElementById("ResultSelectorWith").checked){
  //   try {
  //     afterResultSelectorObj = applyPath(afterResultObj, document.getElementById("ResultSelector").innerText);
  //   } catch(e) {
  //     document.getElementById("AfterResultSelector").innerText = "Invalid ResultSelector path";
  //     // set subsequent fields to errors
  //     return;
  //   }
  // }else{
  //   try {
  //     resultSelectorObj = JSON.parse(document.getElementById("ResultSelector").innerText);
  //   } catch(e) {
  //     console.log("Invalid JSON for ResultSelector");
  //     // warnings to user are handled elsewhere
  //     document.getElementById("AfterResultSelector").innerText = "Error: ResultSelector is invalid JSON";
  //     // todo: set subsequent fields to error
  //     return;
  //   }
  //   try {
  //     afterResultSelectorObj = recursivePath(resultSelectorObj, afterResultObj);
  //   } catch(e) {
  //     console.log(e);
  //     console.error("failed to apply JSONPath ResultSelector recursively");
  //     document.getElementById("AfterResultSelector").innerText = "Failed to evaluate ResultSelector as JSONPath";
  //     // TODO: set subsequent fields to errors
  //     return;
  //   }
  // };
  // document.getElementById("AfterResultSelector").innerText = JSON.stringify(afterResultSelectorObj, null, 4);
  //
  // // step 6: apply ResultPath
  // resultPathVal = document.getElementById("ResultPath").innerText;
  // if (resultPathVal.trim() === "null") {
  //   // special meaning in step functions
  //   // https://docs.aws.amazon.com/step-functions/latest/dg/input-output-resultpath.html#input-output-resultpath-null
  //   afterResultPathObj = inputObj; // before InputPath or Parameters
  // } else {
  //   try {
  //     console.log(`Applying jsonPath(${inputObj}, "${resultPathVal}")`);
  //     afterResultPathObj = applyPath(inputObj, resultPathVal);
  //   } catch(e) {
  //     console.log(resultObj);
  //     console.log("Failed to apply ResultPath")
  //     document.getElementById("AfterParameters").innerText = "Error applying fieldId earlier";
  //     return;
  //   }
  // }
  // console.log(afterResultPathObj);
  // document.getElementById("AfterResultPath").innerText = JSON.stringify(afterResultPathObj, null, 4);
  // console.log("ResultPath applied successfully");

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

// returns a boolean
// is x of type string
function isStr(x){
  return (typeof x === 'string' || x instanceof String);
}
