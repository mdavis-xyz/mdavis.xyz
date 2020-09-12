
// Warn user if input is not valid json
window.addEventListener("load", function(){
    inputEl = document.getElementById("Input");
    inputEl.addEventListener("input", function(){
	warnEl = document.getElementById("InvalidInputWarning")

        try {
	   j = JSON.parse(inputEl.innerText);
	   warnEl.style.display = "none"; // valid json, hide warning
	   inputEl.classList.remove("invalidInput");
	} catch(e) {
	   // invalid json, show warning
	   warnEl.style.display = "inline";
	   inputEl.classList.add("invalidInput");
	};
    });
})

window.addEventListener("load", function(){
  console.log("Setting up evalOne triggers");
  ["InputPath", "Input"].forEach(function(item){
    console.log("About to use backticks");
    console.log(`Setting up evalOne triggers for ${item}`);
    document.getElementById(item).addEventListener("input", function(){
      console.log("Applying InputPath");
      evalOne("Input", "InputPath", "AfterInputPath");
    });
  })

})

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
    console.log(`Path is ${pathEl.value}`);
    if (pathEl.value == "$"){
      // jsonPath(data, "$") doesn't
      // return data
      // not sure why
      resultObj = data;
    }else{
      resultObj = jsonPath(data, pathEl.value);
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

window.addEventListener("load", function(){
    inputEl = document.getElementById("Input")
    // console.log("Adding listener to input changes");
    inputEl.addEventListener("input", evaluate);
});

function fieldEnableDisable(checked, txt_id){
    // console.log(txt_id + " " + checked);
    document.getElementById(txt_id).disabled = ! checked;
    if (! checked) {
      document.getElementById(txt_id).value = "$";
    }
}

function evaluate(){
   // console.log("eval called");
   inputTxt = document.getElementById("Input").innerText;

   document.getElementById("TaskInput").innerText = inputTxt;
   document.getElementById("TaskOutput").innerText = inputTxt;
}


window.addEventListener("load", function(){
    console.log("Setup starting")
    fieldNames = ["InputPath", "Parameters", "ResultSelector", "OutputPath", "ResultPath"]
    fieldNames.forEach(function(item){
        // console.log("For loop for " + item);
	      fieldEnableDisable(document.getElementById(item + "Enabled").checked, item);

    })
});
