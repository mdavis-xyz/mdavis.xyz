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
   document.getElementById("ungroupButton").classList.add('hidden');
   document.getElementById("grouped").classList.add('hidden');
   document.getElementById("chronological").classList.remove('hidden');

}

function byTopic(){
   // var els = document.getElementsByTagName("li");
   // var elList = Array.prototype.slice.call(els);
   // elList.forEach(function(el){
   //    // el = list[0];
   //    var topic = el.getAttribute("data-topic");
   //    var topicEl = document.getElementById("topic-list-" + topic);
   //    topicEl.appendChild(el);
   // })

   document.getElementById("groupButton").classList.add('hidden');
   document.getElementById("ungroupButton").classList.remove('hidden');
   document.getElementById("grouped").classList.remove('hidden');
   document.getElementById("chronological").classList.add('hidden');
}
