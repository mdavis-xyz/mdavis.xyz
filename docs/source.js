// what's going on  here?
// well I want to post political articles on my website
// but if I'm applying for a job, I don't want people seeing a political opinion
// so my linkedin profile has www.mdavis.xyz?src=linkedin
// this code detects that parameter, and hides political pages accordingly
// it 'poisons' other links on the page, so this tag follows you
function hidePolitics() {
  console.log("Hiding political posts");
	// Create the <style> tag
	var style = document.createElement("style");

	// Add a media (and/or media query) here if you'd like!
	// style.setAttribute("media", "screen")
	// style.setAttribute("media", "only screen and (max-width : 1024px)")


	// WebKit hack :(
	style.appendChild(document.createTextNode(""));

	// Add the <style> element to the page
	document.head.appendChild(style);
   style.innerHTML = "[data-politics]{display:none;}";

	return style.sheet;
};

function getSrc(){
   const tag = 'src';
   try{
      var thisUrl = new URL(window.location.href );
      var searchParams = new URLSearchParams(thisUrl.search);
      src = searchParams.get(tag);
   }catch(err){
      // IE
      n = tag.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
      var p = (new RegExp("[\\?&]"+n+"=([^&#]*)")).exec(window.location.href);
      src = (p===null) ? "" : p[1];
   }
   return(src);
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function modifyLinks(){
   console.log("modifying links");
   var els = document.querySelectorAll('a');
   // get the list of all items
   var itms = Array.prototype.slice.call(els);
   var src = getSrc();
   console.log("This page is " + window.location.href);
   var thisDomain = extractHostname(window.location.href);
   console.log("This domain is " + thisDomain);
   for (var i = 0, len = itms.length; i < len; i++) {
      if (itms[i].nodeType == 1){
          var href = itms[i].getAttribute("href");

          const prefixes = ['./', '../', '//',
                            'mdavis.xyz', 'dev.mdavis.xyz', 'www.mdavis.xyz',
                            'http://mdavis.xyz','http://dev.mdavis.xyz','http://www.mdavis.xyz',
                            'https://mdavis.xyz','https://dev.mdavis.xyz','https://www.mdavis.xyz'
                         ]
          var isThisDomain = false;
          try {
             prefixes.forEach(function(prefix){
                isThisDomain |= href.startsWith(prefix);
             });
          }catch(err){
             // IE fallback
             // Would you believe IE doesn't even have string.startsWith ?
             console.log("Using startswith workaround");
             prefixes.forEach(function(prefix){
                isThisDomain |= (href.indexOf(prefix) == 0);
             });
          }

          if (isThisDomain){
             //  href.append('src',src);
             // TODO: better appending of ?src
             itms[i].href = href + '?src=' + getSrc();
             //  console.log("modifying link " + href);
          }else{
            //  console.log("Not modifying external link " + href);
          }
      }
   }
}

var checked = false;
function hideIfNeed(){
   if (! checked){
      if (getSrc() == 'linkedin'){
         hidePolitics();
      }
   }else{
      console.log("Skipping second src check");
   }
   checked = true;
}
hideIfNeed()

window.addEventListener("load",function(){
   src = getSrc();
   // console.log("src is " + src);
   if ((src != '') && (src != null)){
      modifyLinks();
      hideIfNeed();
   }
},false);
