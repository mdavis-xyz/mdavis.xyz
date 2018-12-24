// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const jsdomparser = require("./JSDOMParser");
var readability = require("./index.js");
var JSDOMParser = readability.JSDOMParser;
const fs = require('fs');

var inputFName = "../docs/index.html"
var outputFName = "/tmp/simplified.html"
var url = "https://supermarket.mdavis.xyz"

function readFile(){
   console.log("Reading file");
   fs.readFile(inputFName, 'utf8', function (err,data) {
   if (err) {
      return console.log(err);
   }
      console.log("Read file");
      parseToDOM(data);
   });
}

function parseToDOM(text){
   console.log("Parsing html");
   // console.log(text);
   const dom = new JSDOMParser().parse(text,url);
   // console.log(dom)
   console.log("Parsed html");
   readabilityCheck(dom);
}

function readabilityCheck(dom){
   console.log("\n\n\n\nChecking readability");

   var rdObj = new readability.Readability(dom,{debug:true})
   var readable = rdObj.isProbablyReaderable()
   console.log("Probably readable: " + readable);
   var parsed = rdObj.parse();
   fs.writeFile(outputFName, parsed.content, function(err) {
    if(err) {
      console.log(err);
    }else{
      console.log("The file was saved to " + outputFName);

    }

    // the parse function prints out a lot, and because node is
    // async, it floods stdout so you can't see what I actually want to print.
    // So print this later instead
    setTimeout(function (){
      // omit content when printing
      delete parsed["content"];
      delete parsed["textContent"];

      console.log(parsed);
   },500);
});
   // console.log(article);
}

readFile();
