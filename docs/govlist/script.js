var uncollapsed = new Set();

function duration(){
   var electionDay = new Date('7 Sep 2013'); //election day
   var today = new Date(); //today
   var elapsed_ms = today.getTime() - electionDay.getTime(); //difference in ms
   var elapsed_days = Math.floor(elapsed_ms / (1000 * 60 * 60 * 24)); //difference in days
}

window.addEventListener("load",duration,false);
window.addEventListener("load",copyToGroups,false);

// for each element in the chrono list, copy it to the corresponding
// category in the grouped list
function copyToGroups(){
   var t0 = performance.now();

   // get the list of all items
   var itms = Array.prototype.slice.call(document.getElementById("chrono-list").childNodes);

   if(itms == null){
     console.log("itms is null");
   }

   for (var i = 0, len = itms.length; i < len; i++) {
      if (itms[i].nodeType == 1){
        copyOne(itms[i]);
      }
   }
   var t1 = performance.now();
   console.log("Finished copying items");
   console.log("Copying to topics took " + (t1 - t0) + " milliseconds.")
   document.getElementById('groupButton').classList.add('appear')
   document.getElementById('groupButton').classList.remove('trans');
}

function copyOne(item){
   // find which topic it is from the data tag
   // console.log(item);
   var topic = parseInt(item.dataset.topic);

   // get that list
   var topicList = document.getElementById("topic-list-" + topic);

   if(topicList == null){
     console.log(item);
     console.log("Unable to get topic list for " + topic);
   }

   // clone the element
   var cln = item.cloneNode(true);

   // Append the cloned <li> element to <ul> with id="myList1"
   topicList.appendChild(cln);
}

function chrono(){
   document.getElementById("groupButton").classList.remove('hidden');
   document.getElementById("groupButton").classList.add('appearStat');
   document.getElementById("ungroupButton").classList.add('hidden');
   document.getElementById("ungroupButton").classList.remove('appearStat');
   document.getElementById("grouped").classList.add('collapse');
   document.getElementById("grouped").classList.remove('uncollapse');
   document.getElementById("chrono-list").classList.remove('collapse');
   document.getElementById("chrono-list").classList.remove('collapsed');
   document.getElementById("chrono-list").classList.add('uncollapse');

   // collapse all topics:

   var els = document.getElementById("grouped").getElementsByTagName("ol");
   var elList = Array.prototype.slice.call(els);
   elList.forEach(function(el){
      el.classList.add("collapse");
   });
   var els = document.getElementById("grouped").getElementsByTagName("img");
   var elList = Array.prototype.slice.call(els);
   elList.forEach(function(el){
      el.classList.remove("rotateDown");
   });
   uncollapsed = new Set();

}

function byTopic(){


   document.getElementById("groupButton").classList.add('hidden');
   document.getElementById("groupButton").classList.remove('appearStat');
   document.getElementById("ungroupButton").classList.remove('hidden');
   document.getElementById("ungroupButton").classList.add('appearStat');
   document.getElementById("grouped").classList.remove('collapse');
   document.getElementById("grouped").classList.remove('collapsed');
   document.getElementById("grouped").classList.add('uncollapse');
   document.getElementById("chrono-list").classList.add('collapse');
   document.getElementById("chrono-list").classList.remove('uncollapse');

}


function collapseOrNot(topicID){
   var arrowEl = document.getElementById("arrow-" + topicID);
   var listEl = document.getElementById("topic-list-" + topicID);
   // var wrap = document.getElementById("group-list-wrap-" + topicID);
   // if (wrap.clientHeight) {
   //      wrap.style.height = 0;
   //      arrowEl.classList.add('rotateRight');
   //      arrowEl.classList.remove('rotateDown');
   //  } else {
   //      var listEl = document.getElementById("topic-list-" + topicID);
   //      wrap.style.height = listEl.clientHeight + "px";
   //      arrowEl.classList.remove('rotateRight');
   //      arrowEl.classList.add('rotateDown');
   //  }
   if (uncollapsed.has(topicID)){
      uncollapsed.delete(topicID);
      listEl.classList.remove('uncollapse');
      listEl.classList.add('collapse');
      arrowEl.classList.add('rotateRight');
      arrowEl.classList.remove('rotateDown');
   }else{
      uncollapsed.add(topicID);
      listEl.classList.add('uncollapse');
      listEl.classList.remove('collapse');
      listEl.classList.remove('collapsed');
      arrowEl.classList.remove('rotateRight');
      arrowEl.classList.add('rotateDown');
   }
}
