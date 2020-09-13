
// Add listener for null input warning
window.addEventListener("load", function(){
  ["InputPath", "Parameters", "Result", "ResultSelector"].forEach(function(fieldId){
    document.getElementById(fieldId).addEventListener("input", function(){
      //console.log(`Checking if field for ${fieldId} is null`);
      if (document.getElementById(fieldId).innerText.trim() === "null"){
        console.log(`${fieldId} is null`);
        document.getElementById(`Null${fieldId}Warning`).style.display = "inline";
      }else{
        //console.log(`${fieldId} is not null`);
        document.getElementById(`Null${fieldId}Warning`).style.display = "none";
      }
    })
  })
})

// add listener for tickboxes
window.addEventListener("load", function(){
  tickEl = document.getElementById("InputPathEnabled");
  tickEl.addEventListener("input", evalAll);
  tickEl.addEventListener("input", function(){
    if (tickEl.checked) {
      console.log("InputPath enabled");
      document.getElementById("InputPathExtras").style.display = "inline";
    } else {
      console.log("InputPath disabled");
      document.getElementById("InputPath").innerText = "$";
      document.getElementById("InputPathExtras").style.display = "none";
    }
  });

    // fieldId is "Parameters" or "Result"
    checkRadio = function(fieldId){
      if (document.getElementById("No" + fieldId).checked) {
        document.getElementById(fieldId + "Extra").style.display = "none";
      } else {
        document.getElementById(fieldId + "Extra").style.display = "inline";
      };
      if (! document.getElementById(fieldId + "Without").checked){
        document.getElementById(`Invalid${fieldId}Warning`).style.display = "none";
      }
    };

  // add listeners for Parameters/Result radio buttons
  ["Parameters", "Result", "ResultSelector"].forEach(function (fieldId){
    ["No" + fieldId, fieldId + "With", fieldId + "Without"].forEach(function (id){
      document.getElementById(id).addEventListener("input", function(){
        checkRadio(fieldId);
      });
      document.getElementById(id).addEventListener("input", evalAll);
    });
    checkRadio(fieldId);

    // check the field is selected, with $ in the field
    // replace the value with "$"
    document.getElementById(fieldId + "With").addEventListener("input", function(){
      if (document.getElementById(fieldId + "With").checked){
        document.getElementById(fieldId).innerText = '$';
      }
    });

    // check the field is selected, with $ in the field
    // replace the value with "{}"
    document.getElementById(fieldId + "Without").addEventListener("input", function(){
      if (document.getElementById(fieldId + "Without").checked){
        document.getElementById(fieldId).innerText = '{"x.$": "$"}';
      }
    });

  })

  // when Parameters (no $) is selected
  // replace the default $ value with something valid
  document.getElementById("ParametersWithout").addEventListener("input", function(){
    if (document.getElementById("ParametersWithout").checked){

      evalAll();
    }
  });

  // when Parameters.$ is selected
  // replace value with $
  document.getElementById("ParametersWith").addEventListener("input", function(){
    if (document.getElementById("ParametersWith").checked){
      document.getElementById("Parameters").innerText = "$";
      evalAll();
    }
  });
})

// check if Parameters/Result/ResultSelector (no $) is valid JSON
// but only if Parameters/Result/ResultSelector (no $) is selected
window.addEventListener("load", function(){
  ["Parameters", "Result", "ResultSelector"].forEach(function(fieldId){
    document.getElementById(fieldId).addEventListener("input", function(){
      warnEl = document.getElementById(`Invalid${fieldId}Warning`);
      fieldEl = document.getElementById(fieldId);
      if (document.getElementById(fieldId + "Without").checked) {
        try {
          j = JSON.parse(document.getElementById(fieldId).innerText);
          warnEl.style.display = "none";
          fieldEl.classList.remove("invalidInput")
        } catch (e) {
          warnEl.style.display = "inline";
          fieldEl.classList.add("invalidInput")
        }
      } else {
        warnEl.style.display = "none";
        fieldEl.classList.remove("invalidInput")
      }

    })
  })

})

// set up event listeners
// for triggering the calculation
window.addEventListener("load", function(){
  console.log("Setting up");
  userInputs = ["Input", "InputPath", "Parameters", "Result", "ResultSelector"].forEach(function(item){
    document.getElementById(item).addEventListener("input", function(){
      evalAll();
    });
  });
  evalAll();
})


function evalAll(){
  // Step 1: Check State Input data is valid JSON
  inputEl = document.getElementById("Input");
  warnEl = document.getElementById("InvalidInputWarning")
  try {
    inputObj = JSON.parse(inputEl.innerText);
  } catch (e) {
    console.log(e);
    console.log("Input probably not valid JSON");
    warnEl.style.display = "inline";
    inputEl.classList.add("invalidInput");
    document.getElementById("AfterInputPath").innerText = "Error: State Input Payload is not valid JSON";
    document.getElementById("AfterParameters").innerText = "Error: State Input Payload is not valid JSON";
    // TODO: make all subsequent fields say error
    return;
  };

  // input is valid JSON
  // hide that warning
  console.log("Input is valid JSON");
  warnEl.style.display = "none";
  inputEl.classList.remove("invalidInput");

  // step 2, apply InputPath
  inputPathVal = document.getElementById("InputPath").innerText; // not innerText
  if (inputPathVal === "null") {
    // special meaning in step functions
    afterInputPathObj = {};
  } else {
    try {
      console.log(`Applying jsonPath(${inputObj}, "${inputPathVal}")`);
      afterInputPathObj = applyPath(inputObj, inputPathVal);
    } catch(e) {
      console.log(resultObj);
      console.log("Failed to apply InputPath")
      document.getElementById("AfterParameters").innerText = "Error applying InputPath earlier";
      return;
    }
  }
  console.log(afterInputPathObj);
  document.getElementById("AfterInputPath").innerText = JSON.stringify(afterInputPathObj, null, 4);
  console.log("InputPath applied successfully");

  // step 3: apply Parameters
  if (document.getElementById("NoParameters").checked) {
    // no Parameters field
    // so just pass through whatever happened after InputPath
    document.getElementById("AfterParameters").innerText = document.getElementById("AfterInputPath").innerText;
    afterParametersObj = afterInputPathObj;
  }else if (document.getElementById("ParametersWith").checked){
    parametersVal = document.getElementById("Parameters").innerText;
    try {
      afterParametersObj = applyPath(afterInputPathObj, parametersVal);
    } catch (e) {
      console.log(e);
      console.log("Failed to apply parameters");
      document.getElementById("AfterParameters").innerText = "Error applying Parameters field";
      // TODO: set subsequent fields to errors too
      return;
    }
  } else {
    console.log("Complex parameters evalutation");
    try {
      parametersObj = JSON.parse(document.getElementById("Parameters").innerText);
    } catch (e) {
      console.log(e);
      console.log("Parameters is not valid JSON");
      document.getElementById("AfterParameters").innerText = "Parameters is not valid JSON";
      // warnings and styles managed in other function
      // TODO: set subsequent fields to show errors
      return;
    }
    try {
      afterParametersObj = recursivePath(parametersObj, afterInputPathObj);
    } catch(e) {
      console.log(e);
      console.error("failed to apply JSONPath Parameters recursively");
      document.getElementById("AfterParameters").innerText = "Failed to evaluate Parameters as JSONPath";
      // TODO: set subsequent fields to errors
      return;
    }
  }
  document.getElementById("AfterParameters").innerText = JSON.stringify(afterParametersObj, null, 4);

  // step 4: apply Result
  if (document.getElementById("NoResult").checked) {
    afterResultObj = afterParametersObj;
  }else if (document.getElementById("ResultWith").checked){
    try {
      afterResultObj = applyPath(afterParametersObj, document.getElementById("Result").innerText);
    } catch(e) {
      document.getElementById("AfterResult").innerText = "Invalid Result path";
      // set subsequent fields to errors
      return;
    }
  }else{
    try {
      resultObj = JSON.parse(document.getElementById("Result").innerText);
    } catch(e) {
      console.log("Invalid JSON for result");
      // warnings to user are handled elsewhere
      document.getElementById("AfterResult").innerText = "Error: Result is invalid JSON";
      // todo: set subsequent fields to error
      return;
    }
    try {
      afterResultObj = recursivePath(resultObj, afterParametersObj);
    } catch(e) {
      console.log(e);
      console.error("failed to apply JSONPath Result recursively");
      document.getElementById("AfterResult").innerText = "Failed to evaluate Result as JSONPath";
      // TODO: set subsequent fields to errors
      return;
    }
  };
  document.getElementById("AfterResult").innerText = JSON.stringify(afterResultObj, null, 4);

  // step 5: Apply ResultSelector
  if (document.getElementById("NoResultSelector").checked) {
    afterResultSelectorObj = afterResultObj;
  }else if (document.getElementById("ResultSelectorWith").checked){
    try {
      afterResultSelectorObj = applyPath(afterResultObj, document.getElementById("ResultSelector").innerText);
    } catch(e) {
      document.getElementById("AfterResultSelector").innerText = "Invalid ResultSelector path";
      // set subsequent fields to errors
      return;
    }
  }else{
    try {
      resultSelectorObj = JSON.parse(document.getElementById("ResultSelector").innerText);
    } catch(e) {
      console.log("Invalid JSON for ResultSelector");
      // warnings to user are handled elsewhere
      document.getElementById("AfterResultSelector").innerText = "Error: ResultSelector is invalid JSON";
      // todo: set subsequent fields to error
      return;
    }
    try {
      afterResultSelectorObj = recursivePath(resultSelectorObj, afterResultObj);
    } catch(e) {
      console.log(e);
      console.error("failed to apply JSONPath ResultSelector recursively");
      document.getElementById("AfterResultSelector").innerText = "Failed to evaluate ResultSelector as JSONPath";
      // TODO: set subsequent fields to errors
      return;
    }
  };
  document.getElementById("AfterResultSelector").innerText = JSON.stringify(afterResultSelectorObj, null, 4);


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
