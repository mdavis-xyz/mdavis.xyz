// onload

var init = function () {

	jstat.load();
	
	dynText.load();
		
}

uEvent.load(window, 'load', init, '');






// text

var dynText = {

	'obj' : {},
	
	'load' : function () {
	
		uEvent.load('dynAdd', 'click', dynText.add);
	
		uEvent.load('dynRemove', 'click', dynText.remove);
	
		if (document.getElementById('dynText')) {
		
			dynText.obj = document.getElementById('dynText');
			
			dynText.add();
		
		}
	
	},

	'add' : function () {
	
		var p = document.createElement('p');
		
		var text = document.createTextNode('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
		
		p.appendChild(text);
		
		dynText.obj.appendChild(p);
		
		return false;
	
	},
	
	'remove' : function () {
	
		if (dynText.obj.firstChild) {
				
			dynText.obj.removeChild(dynText.obj.firstChild);
		
		}
	
	}

}


