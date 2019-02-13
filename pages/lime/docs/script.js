const popupId = "popup";
var popupEl = null;
const iframeID = "popup-iframe";
var iframeEl = null;

window.addEventListener("load",function(){
   console.log('onload called');

   // get the list of all links to terms or privacy
   var itms = Array.prototype.slice.call(document.querySelectorAll('[data-popup]'));

   for (var i = 0, len = itms.length; i < len; i++) {
      if (itms[i].nodeType == 1){
         itms[i].addEventListener("click", function (e){
            console.log("Intercepting click");
            clauseShow(this.href);
            e.preventDefault();
         });
      }
   }
},false);


function clauseShow(url){
   console.log("Showing " + url);

   var popupEl = document.getElementById(popupId);
   if (! iframeEl){
      createPopup(url);
   }else{
      changePopup(url);
   }
   showPopup();
}

function createPopup(url){
   console.log("Creating the popup");

   // create outer div
   popupEl = document.createElement('div');
   popupEl.id = popupId;
   popupEl.classList.add('myModal');
   document.body.appendChild(popupEl);

   // close button
   btn = document.createElement('img');
   btn.src = '../images/cross.svg';
   btn.classList.add('close');
   btn.onclick = hidePopup;
   popupEl.appendChild(btn);

   // create iframe
   iframeEl = document.createElement('iframe');
   iframeEl.src = url;
   iframeEl.id = iframeID;
   iframeEl.classList.add("modal-content");
   popupEl.appendChild(iframeEl);

}

function changePopup(url){
   console.log("Changing the popup for " + url);

   // delete old iframe
   // create new one
   // because updating the hash anchor in the URL
   // doesn't make the browser scroll to the new anchor
   //
   // make sure there's an overlap where both elements exist,
   // so the browser doesn't reload the page
   iframeElOld = iframeEl
   iframeEl = document.createElement('iframe');
   iframeEl.src = url;
   iframeEl.classList.add("modal-content");
   popupEl.appendChild(iframeEl);
   popupEl.removeChild(iframeElOld);
   iframeEl.id = iframeEl.id = iframeID;

}

function showPopup(){
   console.log("Showing the popup");
   popupEl.style.display = "block";
   window.onclick = function(event) {
       if (event.target == popupEl) {
           hidePopup();
       }
   }
}

function hidePopup(){
   console.log("Hiding the popup");
   popupEl.style.display = "none";
}

// window.onload = createPopup;
