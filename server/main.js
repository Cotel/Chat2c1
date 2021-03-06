var fs = require('fs');
var express = require('express');
var https = require('https');
var http = require('http');
var helmet = require('helmet');
var SHA3 = require('crypto-js/sha3');
var sanitizeHtml = require('sanitize-html');
var app = express();
app.use(helmet());
//var ports = process.env.PORT || 7773;
var port = process.env.PORT || 7777;

// var httpsOptions = {
// 	key: fs.readFileSync('/etc/ssl/private/raspi.local.key'),
// 	cert: fs.readFileSync('/etc/ssl/certs/raspi.local.crt')
// };

var server = http.createServer(app);
//var servers = https.createServer(httpsOptions, app);
//console.log("Iniciando server en puerto: " + port);
//var io = require('socket.io').listen(app.listen(port));
var ioServer = require('socket.io');
var io = new ioServer();
io.attach(server);
//io.attach(servers);

var users = [];

function checkUrl(string) {
	if(string.toLowerCase().endsWith('gif') ||
		string.toLowerCase().endsWith('png') ||
		string.toLowerCase().endsWith('jpeg') ||
		string.toLowerCase().endsWith('jpg')) {
		return `<img src="${string.toLowerCase()}">`;
	}else if(string.toLowerCase().startsWith("http")) {
		return `<a href="${string.toLowerCase()}" target="_blank">${string}</a>`;
	} else {
		return string;
	}
}

function getClientsInRoom(roomId) {
	var res = [];
	users.forEach(function(user) {
		if(user.room === roomId) {
			res.push(user);
		}
	});
	return res;
}


//app.use(express.static(__dirname + '/../public')); //raspi
// app.use('/room1', express.static(__dirname + '/../public'));
// app.use('/room2', express.static(__dirname + '/../public'));
// app.use('/room3', express.static(__dirname + '/../public'));

app.use(express.static('public'));
app.use('/room1', express.static('public'));
app.use('/room2', express.static('public'));
app.use('/room3', express.static('public'));

app.get('/hello', function(req, res) {
	res.status(200).send("Hello world");
});

io.on('connection', function(socket) {
	var address = socket.request.connection.remoteAddress;
	var random = Math.random() * (999999 - 0) + 0;
	var hash = SHA3(address+random);
	socket.emit('login', hash.toString());
	socket.on('resLogin', function(data) {
		users.push({
			id: socket.id,
			name: data.name,
			room: data.room
		});
		socket.room = data.room;
		socket.join(data.room);
		socket.emit('activeUsers', getClientsInRoom(socket.room));
		socket.broadcast.to(socket.room).emit('userConnect', data.name);
	});

	socket.on('consulta', function() {
		socket.emit('activeUsers', getClientsInRoom(socket.room));
	});

	socket.on('newMessage', function(data) {
		data.usuario = sanitizeHtml(data.usuario, {
			allowedTags: [],
			allowedAttributes: []
		});
		data.texto = sanitizeHtml(data.texto);
		data.texto = data.texto.trim();
		data.texto = checkUrl(data.texto);
		if(data.texto.length > 0) {
			socket.emit('oneMessage', data);
			socket.broadcast.in(socket.room).emit('oneMessage', data);
		}
	});

	socket.on('disconnect', function() {
		socket.leave(socket.room);
		var data;
		for(var i = 0; i<users.length; i++) {
			if(users[i].id == socket.id) {
				data = users.splice(i, 1);
				break;
			} else {
				continue;
			}
		}
		socket.broadcast.to(socket.room).emit('userLeave', data);
	});
});

server.listen(port, function() {
	console.log("Iniciando servidor http en puerto: " + port);
});
// servers.listen(ports, function() {
// 	console.log("Iniciando servidor https en puerto: " + ports);
// });
