if(Cookie.get('name') == null) {
	var resuname = prompt("Introduce nombre de usuario", "");
	if(resuname != null) {
		Cookie.set('name', resuname, {expires: 7, path: '/'});
	} else {
		Cookie.set('name', 'usuario', {expires: 7, path: 7});
	}
}

var socket = io.connect('', {'forceNew': true});

function render(data) {
	var html = data.map(function(elem, index) {
		return(`<div>
				<strong>${elem.athor}</strong>
				<em>${elem.text}</em>
		</div>`)
	}).join(" ");

	document.getElementById('chat').innerHTML = html;
}

function addMessage() {
	var texto = document.getElementById("cajaT");
	if(texto != null) {
		var mensaje = {
			usuario: Cookie.get('name'),
			texto: texto.value
		};
		socket.emit('newMessage', mensaje);
	}
}

socket.on('messages', function(data) {
	render(data);
});
