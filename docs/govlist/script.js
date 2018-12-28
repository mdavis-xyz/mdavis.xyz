function duration(){
   var electionDay = new Date('7 Sep 2013'); //election day
   var today = new Date(); //today
   var elapsed_ms = today.getTime() - electionDay.getTime(); //difference in ms
   var elapsed_days = Math.floor(elapsed_ms / (1000 * 60 * 60 * 24)); //difference in days
}

window.onload = function () {
   duration();
}
