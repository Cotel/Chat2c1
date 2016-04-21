$(document).ready(function() {
	if(Cookies.get('name') === null || Cookies.get('name') === "" ||
 		Cookies.get('name') === "null" || Cookies.get('name') === undefined) {
		var resuname = prompt("Introduce nombre de usuario", "");
		if(resuname !== "") {
			Cookies.set('name', resuname, {path: '/'});
		} else {
			Cookies.set('name', 'Anonymous', {path: '/'});
		}
	}

	Notification.requestPermission();

	// emojione.imageType = 'svg';
	// emojione.sprites = true;
	// emojione.imagePathSVGSprites = 'libs/emojione/assets/sprites/emojione.sprites.svg';

});

var socket = io.connect(window.location.host);
var notification;
var myId = "";
var lastUser = "";
var lastName = "";
var noleidos = 0;

var focused = true;

window.onfocus = function() {
	focused = true;
	notification.close();
	noleidos = 0;
	document.title = "Chat 2c1";
};
window.onblur = function() {
	focused = false;
};

function getColor(color) {
	var tono = tinycolor(color);
	var res = ("hsv (" +tono.toHsv().h+ "% 65% 75%)");
	res = tinycolor(res);
	return res.toHex();
}

function generateHTML(elem) {
	var res = "";
	elem.texto = emojione.toImage(elem.texto);
	var color = elem.id.substring(0,6);
	if(myId == elem.id) {
		if(elem.id == lastUser) {
			res = (`<div class="message selfmessage">
					<div class="message-text">${elem.texto}</div>
			</div>`);
		} else {
			res = (`<div class="message selfmessage">
					<div class="message-user" style="color:#${getColor(color)};">${elem.usuario}</div>
					<div class="message-text">${elem.texto}</div>
			</div>`);
		}
	} else {
		if(elem.usuario == lastName && elem.id == lastUser) {
			res = (`<div class="message">
					<div class="message-text">${elem.texto}</div>
			</div>`);
		} else {
			res = (`<div class="message">
					<div class="message-user" style="color:#${getColor(color)};">${elem.usuario}</div>
					<div class="message-text">${elem.texto}</div>
			</div>`);
		}
	}
	lastName = elem.usuario;
	lastUser = elem.id;
	return res;
}

function checkCookie() {
	if(Cookies.get('name') === "" || Cookies.get('name') === undefined) {
		Cookies.set('name', 'Anonymous', {path: '/'});
	}
}

function render(data) {
	var html = "";
	data.forEach(function (elem) {
		html += generateHTML(elem);
	});
	document.getElementById('chat').innerHTML = html;
}

function renderOne(data) {
	var html = generateHTML(data);
	document.getElementById('chat').innerHTML += html;
}

function addMessage() {
	var texto = document.getElementById("cajaT");
	if(texto.value.length <= 0) {
		return false;
	} else {
		if(texto.value.trim() === "/who") {
			document.getElementById("cajaT").value = "";
			socket.emit('consulta');
			return false;
		}
		checkCookie();
		var mensaje = {
			id: myId,
			usuario: Cookies.get('name'),
			texto: texto.value
		};
		socket.emit('newMessage', mensaje);
	}
	document.getElementById("cajaT").value = "";
	return false;
}

socket.on('login', function(data) {
	myId = data;
	socket.emit('resLogin', Cookies.get('name'));
});

socket.on('activeUsers', function(data) {
	var res = data.map(function(item, index) {
		return item.name+", ";
	}).join("");
	res = res.substring(0, res.length-2);
	var html = `<div class="message">
					<div class="system-message">Connected users: ${res}</div>
				</div>`;
	document.getElementById('chat').innerHTML += html;
});

socket.on('userConnect', function(data) {
	var html = `<div class="message">
					<div class="system-message">${data} connected</div>
				</div>`;
	document.getElementById('chat').innerHTML += html;
	var chatCont = document.getElementById('chat');
	chatCont.scrollTop = chatCont.scrollHeight;
});

socket.on('userLeave', function(data) {
	var res = data.map(function(item, index) {
		return item.name;
	}).join("");
	var html = `<div class="message">
					<div class="system-message">${res} disconnected</div>
				</div>`;
	document.getElementById('chat').innerHTML += html;
	var chatCont = document.getElementById('chat');
	chatCont.scrollTop = chatCont.scrollHeight;
});

socket.on('messages', function(data) {
	render(data);
	var chatCont = document.getElementById('chat');
	chatCont.scrollTop = chatCont.scrollHeight;
});

socket.on('oneMessage', function(data) {
	if(Notification.permission == "granted") {
		if(data.id !== myId && !focused) {
			var options = {
				body: emojione.shortnameToUnicode(data.texto)
			};
			notification = new Notification(data.usuario, options);
			setTimeout(function() {
				notification.close();
			}, 3000);
		}
	}

	if(!focused) {
		noleidos += 1;
		document.title = ("("+noleidos+") Chat 2c1");
	}
	renderOne(data);
	var chatCont = document.getElementById('chat');
	chatCont.scrollTop = chatCont.scrollHeight;
});
