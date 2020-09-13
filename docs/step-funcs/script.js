
// Add listener for null input warning
window.addEventListener("load", function(){
  ["InputPath", "Parameters"].forEach(function(fieldId){
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

  // and now listeners for Parameters radio buttons
  checkParametersRadio = function(){
    if (document.getElementById("NoParameters").checked) {
      // document.getElementById("Parameters").innerText = "$";
      document.getElementById("ParametersExtra").style.display = "none";
    } else {
      document.getElementById("ParametersExtra").style.display = "inline";
    };
    if (! document.getElementById("ParametersWithout").checked){
      document.getElementById("InvalidParametersWarning").style.display = "none";
    }
  };
  ["NoParameters", "ParametersWith", "ParametersWithout"].forEach(function (id){
    document.getElementById(id).addEventListener("input", checkParametersRadio);
    document.getElementById(id).addEventListener("input", evalAll);
  });
  checkParametersRadio();

  // when Parameters (no $) is selected
  // replace the default $ value with something valid
  document.getElementById("ParametersWithout").addEventListener("input", function(){
    if (document.getElementById("ParametersWithout").checked){
      document.getElementById("Parameters").innerText = '{"x.$": "$"}';
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

// check if Parameters (no $) is valid JSON
// but only if Parameters (no $) is selected
window.addEventListener("load", function(){
  document.getElementById("Parameters").addEventListener("input", function(){
    warnEl = document.getElementById("InvalidParametersWarning");
    parametersEl = document.getElementById("Parameters");
    if (document.getElementById("ParametersWithout").checked) {
      try {
        j = JSON.parse(document.getElementById("Parameters").innerText);
        warnEl.style.display = "none";
        parametersEl.classList.remove("invalidInput")
      } catch (e) {
        warnEl.style.display = "inline";
        parametersEl.classList.add("invalidInput")
      }
    } else {
      warnEl.style.display = "none";
      parametersEl.classList.remove("invalidInput")
    }

  })
})

// set up event listeners
// for triggering the calculation
window.addEventListener("load", function(){
  console.log("Setting up");
  userInputs = ["Input", "InputPath", "Parameters"].forEach(function(item){
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
    afterParametersObj = recursivePath(parametersObj, afterInputPathObj);
  }
  document.getElementById("AfterParameters").innerText = JSON.stringify(afterParametersObj, null, 4);

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
