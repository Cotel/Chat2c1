var express = require('express');
var sanitizeHtml = require('sanitize-html');
var app = express();
var port = process.env.PORT || 7777;
console.log("Iniciando server en puerto: " + port);
var io = require('socket.io').listen(app.listen(port));

var mensajes = [];

app.use(express.static('public'));

app.get('/hello', function(req, res) {
	res.status(200).send("Hello world");
});

io.on('connection', function(socket) {
	var address = socket.handshake.address;
	//console.log("Connection from: " + address.address);
	socket.emit('messages', mensajes);

	socket.on('newMessage', function(data) {
		data.usuario = sanitizeHtml(data.usuario, {
			allowedTags: [],
			allowedAttributes: []
		});
		data.texto = sanitizeHtml(data.texto);
		data.texto = data.texto.trim();
		if(data.texto.length > 0) {
			mensajes.push(data);
			if(mensajes.length > 20) {
				mensajes.shift();
			}
			io.sockets.emit('oneMessage', mensajes[mensajes.length-1]);
		}
	});
});
