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

	window.emojioneVersion = "2.1.4";
	$("#content").emojioneArea({
		container: "#cajaT",
		hideSource: false,
	});
});

var socket = io.connect(window.location.host);
var myId = "";
var lastUser = "";
var lastName = "";


function getColor(color) {
	var tono = tinycolor(color);
	var res = ("hsv (" +tono.toHsv().h+ "% 64% 77%)");
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
});

socket.on('userLeave', function(data) {
	var res = data.map(function(item, index) {
		return item.name;
	}).join("");
	var html = `<div class="message">
					<div class="system-message">${res} disconnected</div>
				</div>`;
	document.getElementById('chat').innerHTML += html;
});

socket.on('messages', function(data) {
	render(data);
	window.scrollTo(0,document.body.scrollHeight);
});

socket.on('oneMessage', function(data) {
	renderOne(data);
	window.scrollTo(0,document.body.scrollHeight);
});
