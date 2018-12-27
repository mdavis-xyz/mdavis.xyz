// evt

var evt = {};

evt.attach = function (objId, type, handler, unloadQue) {

	switch(typeof(objId)) {
		
		case 'string' :
		
			if (document.getElementById(objId)) {
			
				var obj = document.getElementById(objId);
				
			} else {
			
				jstat.add('evt: no such object');
				
				return;
			
			}
		
		break;
		
		case 'object' :
		
			var obj = objId;
		
		break;
		
		default:
		
			jstat.add('evt: wrong obj type');
			
			return;
		
	}

	if (document.addEventListener) { // Moz
				
		obj.addEventListener(type, handler, false);
				
		if (unloadQue) {
		
			var evtX = (function () {
				
				var t = type;
				var h = handler;
				var o = obj;
			
				return function () {
				
					jstat.add('remove: type: ' + t + ', handler: ' + h.toString());
				
					o.removeEventListener(t, h, false);
									
				}
			
			})();
			
			unloadQue.push(evtX);
			
		}
								
	} else if (document.attachEvent) { // IE, duplicates possible
										
		switch (type) {
			
			case 'load' :
			
				obj.attachEvent('onload', handler);
			
				break;
			
			case 'click' :
							
				obj.attachEvent('onclick', handler);
				obj.attachEvent('ondblclick', handler);
			
				break;
			
			case 'mousedown' :
			
				obj.attachEvent('onmousedown', handler);
				obj.attachEvent('ondblclick', handler);
			
				break;
			
			case 'mouseover' :
			
				obj.attachEvent('onmouseover', handler);
			
				break;
			
			case 'change' :
			
				obj.attachEvent('onchange', handler);
				
				break;
			
			case 'keyup' :
			
				obj.attachEvent('onkeyup', handler);
				
				break;
			
			case 'keypress' :
			
				obj.attachEvent('onkeypress', handler);
				
				break;
			
			case 'blur' :
			
				obj.attachEvent('onblur', handler);
				
				break;
			
			case 'submit' :
			
				obj.attachEvent('onsubmit', handler);
				
				break;
			
			default :
			
				jstat.add('evt: unknown event type');
			
		}
	
	
	}

}

evt.target = function(e) {
	
	if (e.target) {
	
		return e.target;
		
	} else if (e.srcElement) {
	
		return e.srcElement;
		
	}

}





// !xhr

var xhr = {};

xhr.count = 0;

xhr.getJSON = function (url, handler) {

	var request = {};
	
	if (window.XMLHttpRequest) {
	
		request = new XMLHttpRequest();
		
		if (request.overrideMimeType) {
		
			request.overrideMimeType('text/html');
			
		}
	
	} else if (window.ActiveXObject) {
	
		request = new ActiveXObject();
		
		try {
		
			request = new ActiveXObject("Msxml2.XMLHTTP");
			
		} catch (e) {
		
			try {
			
				request = new ActiveXObject("Microsoft.XMLHTTP");
				
			} catch (e) {}
			
		}

	}
	
	if (!request) {
	
		jstat.add('xhr: no request made');
	
		return false;
	
	}
	
	request.onreadystatechange = function () {
	
		if (request.readyState == 4) {
		
			if (request.status == 200) {
			
				if (handler) {
				
					var jsonObj = eval('(' + crlfOut(request.responseText) + ')');
				
					handler(jsonObj);
					
				}
								
				//jstat.add(request.getAllResponseHeaders());
				
				return false;
				
			} else {
			
				jstat.add('xhr: server error');
				
				return false;
				
			}
			
		}
		
	}
	
	var date = new Date();

	if (!url.match(/\?/)) {
		url += '?jstime=' + date.getTime() + '&xhrCount=' + xhr.count;
	} else {
		url += '&jstime=' + date.getTime() + '&xhrCount=' + xhr.count;
	}
	
	request.open('GET', url, true);
	request.send(null);

	xhr.count ++;

}




// loadScript

function loadScript(url) {
	
	var q = (url.match(/\?/)) ? '&' : '?';
	var src = url + q + 'qRandom=' + Math.random();
			
	var head = document.getElementsByTagName('head')[0];
	
	var moduleScript = document.createElement('script');
	
	moduleScript.setAttribute('type', 'text/javascript');
	moduleScript.setAttribute('src', src);
	
	head.appendChild(moduleScript);	

}




// !jstat

var jstat = {

	'obj' : {},
	
	'timeout' : {},
	
	'maxtime' : 10000,
	
	'load' : function () {
	
		jstat.obj = document.getElementById('jstat');
		jstat.obj.setAttribute('class', 'jstat');
		jstat.obj.setAttribute('className', 'jstat');
		
		jstat.add('jstat loaded');
	
	},

	'add' : function (msg) {
					
		jstat.obj.style.visibility = 'visible';
		
		if (jstat.timeout) {
		
			clearTimeout(jstat.timeout);
			
		}
		
		jstat.obj.innerHTML += '<p>' + msg + '</p>';
		
		jstat.timeout = setTimeout('jstat.clear();', jstat.maxtime);
					
	},
	
	'clear' : function () {
	
		clearTimeout(jstat.timeout);

		jstat.obj.style.visibility = 'hidden';
	
		jstat.obj.innerHTML = '';
	
	},
	
	'confirm' : function () {
	
		jstat.add('yup');
	
	},
	
	'post' : function (msg) {
	
		jstat.obj.style.visibility = 'visible';
		
		if (jstat.timeout) {
		
			clearTimeout(jstat.timeout);
			
		}
		
		jstat.obj.innerHTML = '<p>' + msg + '</p>';
		
		jstat.timeout = setTimeout('jstat.clear();', jstat.maxtime);
	
	}
	
}





// !uEvent

var uEvent = {

	'load' : function (id, type, callBack, embedObj) {
			
		if (id && type && callBack) {
		
			switch(typeof(id)) {
				
				case 'string' :
				
					var obj = document.getElementById(id);
				
				break;
				
				case 'object' :
				
					var obj = id;
				
				break;
				
				default:
				
					jstat.add('uEvent.load fail');
					
					return;
				
			}
			
			if (embedObj) {
			
				obj.x = embedObj;
				
			}
				
			if (document.addEventListener) { // Moz
						
				obj.addEventListener(type, callBack, false);
						
			} else if (document.attachEvent) { // IE, duplicates possible
												
				switch (type) {
					
					case 'load' :
					
						obj.attachEvent('onload', callBack);
					
						break;
					
					case 'click' :
					
						obj.attachEvent('onclick', callBack);
						obj.attachEvent('ondblclick', callBack);
					
						break;
					
					case 'mousedown' :
					
						obj.attachEvent('onmousedown', callBack);
						obj.attachEvent('ondblclick', callBack);
					
						break;
					
					case 'mouseover' :
					
						obj.attachEvent('onmouseover', callBack);
					
						break;
					
					case 'change' :
					
						obj.attachEvent('onchange', callBack);
						
						break;
					
					case 'keyup' :
					
						obj.attachEvent('onkeyup', callBack);
						
						break;
					
					case 'keypress' :
					
						obj.attachEvent('onkeypress', callBack);
						
						break;
					
					case 'blur' :
					
						obj.attachEvent('onblur', callBack);
						
						break;
					
					default :
					
						jstat.add('unknown event type');
					
				}
												
			}
						
		} else {
		
			jstat.add('uEvent.load fail');
			
			return;
			
		}
	
	},
	
	'unload' : function (id, type, callBack) {
	
		if (document.getElementById(Id)) {
	
			var obj = document.getElementById(Id);
	
			if (document.removeEventListener) { // Moz
						
				obj.removeEventListener(type, callBack, false);
						
			} else if (document.detachEvent) { // IE
					
				switch (type) {
				
					case 'click' :
					
						obj.detachEvent('onclick', callBack);
						obj.detachEvent('ondblclick', callBack);
						
						break;
						
					case 'mousedown' :
					
						obj.detachEvent('onmousedown', callBack);
						obj.detachEvent('ondblclick', callBack);
						
						break;
						
					default :
						
						jstat.add('unknown event type');
						
				}

			}
			
		}
	
	},
	
	'target' : function(e) {
	
		if (e.target) {
		
			return e.target;
			
		} else if (e.srcElement) {
		
			return e.srcElement;
			
		}
	
	}
}




// jsonEval

function jsonEval(jsonData) {

	var json = eval('(' + crlfOut(jsonData) + ')');

}




// crlfOut

function crlfOut(text) {

	var crlfReg = /[\r\n]/g;

	var textOut = text.replace(crlfReg, '');

	return textOut;
	
}




// globalEval

var globalEval = function globalEval(src) {

    if (window.execScript) {
        window.execScript(src);
        return;
    }
    
    var fn = function() {
        window.eval.call(window,src);
    };
    
    fn();
    
};


