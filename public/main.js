if(Cookies.get('name') == null) {
	var resuname = prompt("Introduce nombre de usuario", "");
	if(resuname != null) {
		Cookies.set('name', resuname, {expires: 7, path: '/'});
	} else {
		Cookies.set('name', 'usuario', {expires: 7, path: 7});
	}
}

var socket = io.connect(window.location.host);
var lastUser = "";

function render(data) {
	var html = data.map(function(elem, index) {
		if(elem.usuario == Cookies.get('name')) {
			if(elem.usuario == lastUser) {
				return(`<div class="message selfmessage">
						<div class="message-text">${elem.texto}</div>
				</div>`)
			} else {
				lastUser = elem.usuario;
				return(`<div class="message selfmessage">
						<div class="message-user">${elem.usuario}</div>
						<div class="message-text">${elem.texto}</div>
				</div>`)
			}
		} else {
			if(elem.usuario == lastUser) {
				return(`<div class="message">
						<div class="message-text">${elem.texto}</div>
				</div>`)
			} else {
				lastUser = elem.Usuario;
				return(`<div class="message">
						<div class="message-user">${elem.usuario}</div>
						<div class="message-text">${elem.texto}</div>
				</div>`)
			}
		}
	}).join(" ");

	document.getElementById('chat').innerHTML = html;
}

function addMessage() {
	var texto = document.getElementById("cajaT");
	if(texto == null || texto == "") {
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
	$('#chat').scrollTop($("#chat")[0].scrollHeight);
});
