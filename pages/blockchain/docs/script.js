
var backButton = null;
var navHistory = [];
var navDirections = [];
var currentElID = null; // won't be used until we navigate anyway

function slide(oldElID,newElID,direction){
   slideNoHist(oldElID,newElID,direction);
   if(navHistory.length == 0) {
      document.getElementById("back-button").setAttribute('class', 'button-back slide-in-button'); // not hidden
   }
   navHistory.push(oldElID);
   navDirections.push(direction);
}

function slideNoHist(oldElID,newElID,direction){
   var newEl = document.getElementById(newElID + '-1');
   var oldEl = document.getElementById(oldElID + '-1');
   console.log('sliding ' + oldElID + ' to ' + direction + ' to make room for ' + newElID);
   newEl.setAttribute('class', 'wrap1 slide-in-' + direction);
   oldEl.setAttribute('class', 'wrap1 slide-out-' + direction);
   newEl.scrollTop = 0;
   currentElID = newElID;
}

function reverseDirection(prevDir){
   var newDir;
   switch(prevDir.toLowerCase()) {
       case 'up':
           newDir = 'down';
           break;
       case 'down':
           newDir = 'up';
           break;
       case 'left':
           newDir = 'right';
           break;
       case 'right':
           newDir = 'left';
           break;
   }
   console.log('reverse of ' + prevDir + ' is ' + newDir);
   return(newDir);
}

function back(){
   console.log("Back button pressed");
   var newElID = navHistory.pop();
   var direction = reverseDirection(navDirections.pop());
   console.log('Sliding back from ' + currentElID + ' to ' + newElID);
   slideNoHist(currentElID,newElID,direction);
   if(navHistory.length == 0) {
      if (backButton == null){
         backButton = document.getElementById('back-button');
      }
      backButton.setAttribute('class', 'button-back slide-out-button');
   }
}
