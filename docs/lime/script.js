const popupId = "popup";
var popupEl = null;
const iframeID = "popup-iframe";
var iframeEl = null;


function clauseShow(page,section){
   console.log("Showing " + section + "of page " + page);

   var popupEl = document.getElementById(popupId);
   if (! iframeEl){
      createPopup(page,section);
   }else{
      changePopup(page,section);
   }
   showPopup();
}

function createPopup(page,section){
   console.log("Creating the popup");

   // create outer div
   popupEl = document.createElement('div');
   popupEl.id = popupId;
   popupEl.classList.add('myModal');
   document.body.appendChild(popupEl);

   //
   // // close button, blue
   // btn = document.createElement('span');
   // btn.classList.add('close');
   // btn.classList.add('button');
   // btn.onclick = hidePopup;
   // popupEl.appendChild(btn);
   // icon = document.createElement('img');
   // icon.src = "../images/cross.svg";
   // icon.classList.add("icon");
   // icon.alt = "&times;";
   // icon.width = "20";
   // icon.height = "20";
   // btn.appendChild(icon);


   // close button
   btn = document.createElement('span');
   btn.classList.add('close');
   btn.innerHTML = "&times;";
   btn.onclick = hidePopup;
   popupEl.appendChild(btn);

   // create iframe
   iframeEl = document.createElement('iframe');
   if (section){
      iframeEl.src = page + "#" + section;
   }else{
      iframeEl.src = page;
   }
   iframeEl.id = iframeID;
   iframeEl.classList.add("modal-content");
   popupEl.appendChild(iframeEl);

}

function changePopup(page,section){
   console.log("Changing the popup for " + section + " on page " + page);

   // delete old iframe
   // create new one
   // because updating the hash anchor in the URL
   // doesn't make the browser scroll to the new anchor
   //
   // make sure there's an overlap where both elements exist,
   // so the browser doesn't reload the page
   iframeElOld = iframeEl
   iframeEl = document.createElement('iframe');
   iframeEl.src = page + "#" + section;
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
