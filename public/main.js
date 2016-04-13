if(Cookies.get('name') == null) {
	var resuname = prompt("Introduce nombre de usuario", "");
	if(resuname != null) {
		Cookies.set('name', resuname, {expires: 7, path: '/'});
	} else {
		Cookies.set('name', 'Anonymous', {expires: 7, path: '/'});
	}
}

var socket = io.connect(window.location.host);
var lastUser = "";

function generateHTML(elem) {
	var res = "";
	if(Cookies.get('name') == elem.usuario) {
		if(elem.usuario == lastUser) {
			res = (`<div class="message selfmessage">
					<div class="message-text">${elem.texto}</div>
			</div>`);
		} else {
			res = (`<div class="message selfmessage">
					<div class="message-user">${elem.usuario}</div>
					<div class="message-text">${elem.texto}</div>
			</div>`);
		}
	} else {
		if(elem.usuario == lastUser) {
			res = (`<div class="message">
					<div class="message-text">${elem.texto}</div>
			</div>`);
		} else {
			res = (`<div class="message">
					<div class="message-user">${elem.usuario}</div>
					<div class="message-text">${elem.texto}</div>
			</div>`);
		}
	}
	lastUser = elem.usuario;
	return res;
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
	if(texto.value == null || texto.value == "") {
		return false;
	} else {
		var mensaje = {
			usuario: Cookies.get('name'),
			texto: texto.value
		};
		socket.emit('newMessage', mensaje);
	}
	document.getElementById("cajaT").value = "";
}

socket.on('messages', function(data) {
	render(data);
	window.scrollTo(0,document.body.scrollHeight);
});

socket.on('oneMessage', function(data) {
	renderOne(data);
	window.scrollTo(0,document.body.scrollHeight);
});
