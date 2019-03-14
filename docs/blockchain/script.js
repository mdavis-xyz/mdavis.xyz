
var backButton = null;
var navHistory = [];
var navDirections = [];
var currentElID = null; // won't be used until we navigate anyway

// leaf is a bool
// true if we have reached an end
function slide(oldElID,newElID,direction,leaf){
   slideNoHist(oldElID,newElID,direction);
   if(navHistory.length == 0) {
      var backButton = document.getElementById("back-button");
      console.log("Show back button");
      backButton.classList.add('slide-in-button'); // not hidden
      backButton.classList.remove('slide-out-button'); // not hidden
      backButton.classList.remove('hidden'); // not hidden
   }
   navHistory.push(oldElID);
   navDirections.push(direction);
   var findMore = document.getElementById("find-more");
   if (leaf){
      console.log('show the "find more" element');
      findMore.classList.remove('hidden');
      findMore.classList.remove('slide-out-find-more');
      findMore.classList.add('slide-in-find-more');
   }else{
      console.log('hide the "find more" element');
      findMore.classList.add('slide-out-find-more');
      findMore.classList.remove('slide-in-find-more');
   }
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
      console.log('hide back button');
      if (backButton == null){
         backButton = document.getElementById('back-button');
      }
      backButton.classList.add('slide-out-button'); // not hidden
      backButton.classList.remove('slide-in-button'); // not hidden
   }

   var findMore = document.getElementById("find-more");
   console.log('hide the "find more" element');
   findMore.classList.add('slide-out-find-more');
   findMore.classList.remove('slide-in-find-more');
}
