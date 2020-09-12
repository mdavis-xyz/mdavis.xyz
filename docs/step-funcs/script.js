
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
    }
  };
  ["NoParameters", "ParametersWith", "ParametersWithout"].forEach(function (id){
    document.getElementById(id).addEventListener("input", checkParametersRadio);
    document.getElementById(id).addEventListener("input", evalAll);
  });
  checkParametersRadio();

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
  if (inputPathVal === "$"){
    // jsonPath(x, "$") does not just return x
    // not sure why, maybe Step Functions uses non-standard behavior?
    afterInputPathObj = inputObj;
  } else if (inputPathVal === "null") {
    // special meaning in step functions
    afterInputPathObj = {};
  } else {
    try {
      console.log(`Applying jsonPath(${inputObj}, "${inputPathVal}")`);
      afterInputPathObj = jsonPath(inputObj, inputPathVal);
    } catch(e) {
      console.log(resultObj);
      console.log("Failed to apply InputPath")
      document.getElementById("AfterParameters").innerText = "Error applying InputPath earlier";
      return;
    }
  }
  console.log(afterInputPathObj);
  document.getElementById("AfterInputPath").innerText = JSON.stringify(afterInputPathObj);
  console.log("InputPath applied successfully");

  // step 3: apply Parameters
  if (document.getElementById("NoParameters").checked) {
    // no Parameters field
    // so just pass through whatever happened after InputPath
    document.getElementById("AfterParameters") = document.getElementById("AfterInputPath").innerText;
  }else if (document.getElementById("ParametersWith").checked){
    parametersVal = document.getElementById("Parameters").innerText;
    try {
      afterParametersObj = jsonPath(afterInputPathObj, parametersVal);
    } catch (e) {
      console.log(e);
      console.log("Failed to apply parameters");
      document.getElementById("AfterParameters").innerText = "Error applying Parameters field";
      // TODO: set subsequent fields to errors too
      return;
    }
  } else {
    console.log("Complex parameters");
    document.getElementById("AfterParameters").innerText = "Not implemented yet";
    return
    // recursively check for $
  }
  document.getElementById("AfterParameters").innerText = JSON.stringify(afterParametersObj);

}

//
// // Warn user if input is not valid json
// window.addEventListener("load", function(){
//     inputEl = document.getElementById("Input");
//     inputEl.addEventListener("input", function(){
// 	warnEl = document.getElementById("InvalidInputWarning")
//
//         try {
// 	   j = JSON.parse(inputEl.innerText);
// 	   warnEl.style.display = "none"; // valid json, hide warning
// 	   inputEl.classList.remove("invalidInput");
// 	} catch(e) {
// 	   // invalid json, show warning
// 	   warnEl.style.display = "inline";
// 	   inputEl.classList.add("invalidInput");
// 	};
//     });
// })
//
// window.addEventListener("load", function(){
//   console.log("Setting up evalOne triggers");
//   ["InputPath", "Input"].forEach(function(item){
//     console.log("About to use backticks");
//     console.log(`Setting up evalOne triggers for ${item}`);
//     document.getElementById(item).addEventListener("input", function(){
//       console.log("Applying InputPath");
//       evalOne("Input", "InputPath", "AfterInputPath");
//     });
//   })
//
// })
//
// takes in 3 element IDs
// this function grabs the innerText from each,
// the json content from the first
// has the content of the second applied as a path
// and the result is saved into the third
function evalOne(inputId, pathId, resultId){
  console.log(`Applying path in ${pathId} to content in ${inputId} putting it in ${resultId}`)
  inputEl = document.getElementById(inputId);
  pathEl = document.getElementById(pathId);
  resultEl = document.getElementById(resultId);
  try {
    data = JSON.parse(inputEl.innerText);
    console.log("Input obj is");
    console.log(data);
    console.log(`Path is ${pathEl.innerText}`);
    if (pathEl.innerText == "$"){
      // jsonPath(data, "$") doesn't
      // return data
      // not sure why
      resultObj = data;
    }else{
      resultObj = jsonPath(data, pathEl.innerText);
    }
    console.log(resultObj);
    resultEl.innerText = JSON.stringify(resultObj);
    console.log(`Successfully applied path ${pathId} to ${resultId}`);
  } catch(e) {
    if (e instanceof SyntaxError) {
        resultEl.innerText = "JSON parsing error"
        console.error(e.name);
    } else {
        resultEl.innerText = "JSONPath error";
        console.error(e.message);
    }
  };

}
//
// window.addEventListener("load", function(){
//     inputEl = document.getElementById("Input")
//     // console.log("Adding listener to input changes");
//     inputEl.addEventListener("input", evaluate);
// });
//
// function fieldEnableDisable(checked, txt_id){
//     // console.log(txt_id + " " + checked);
//     document.getElementById(txt_id).disabled = ! checked;
//     if (! checked) {
//       document.getElementById(txt_id).innerText = "$";
//     }
// }
//
// function evaluate(){
//    // console.log("eval called");
//    inputTxt = document.getElementById("Input").innerText;
//
//    document.getElementById("TaskInput").innerText = inputTxt;
//    document.getElementById("TaskOutput").innerText = inputTxt;
// }
//
//
// window.addEventListener("load", function(){
//     console.log("Setup starting")
//     fieldNames = ["InputPath", "Parameters", "ResultSelector", "OutputPath", "ResultPath"]
//     fieldNames.forEach(function(item){
//         // console.log("For loop for " + item);
// 	      fieldEnableDisable(document.getElementById(item + "Enabled").checked, item);
//
//     })
// });
