var uncollapsed = new Set();

function duration(){
   var electionDay = new Date('7 Sep 2013'); //election day
   var today = new Date(); //today
   var elapsed_ms = today.getTime() - electionDay.getTime(); //difference in ms
   var elapsed_days = Math.floor(elapsed_ms / (1000 * 60 * 60 * 24)); //difference in days
}

window.onload = function () {
   duration();
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
