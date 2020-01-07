var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io")(server)

// Express setup
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

class Player {
	constructor(name) {
		this.name = name
		this.id = null; 
		this.score = 0;
	}
}
var player1 = new Player('Player 1: '), player2 = new Player('Player 2: ');
var target = 21;

io.on('connection', function(socket) {
	updateScores();
	if (player1.id != null && player2.id != null){
		socket.emit('alert', 'The server is full, you are observing');
	} else {		
		if (player1.id == null) {
			player1.id = socket.id;
			broadcast(socket, 'Player1 connected');
			socket.emit('connector', {player: 1})
		} else if (player2.id == null) {
			player2.id = socket.id;
			broadcast(socket, 'Player2 connected');
			socket.emit('connector', {player: 2})
		} else {
			doclog(socket, 'Unexpected session error. Resetting. Refresh the page.');
			//reset();
		};
	}
	console.log('con', player1.id, player2.id);

	socket.on('setUser', function(data){
		if (data.player == 1) {
			player1.name = data.name;
		} else if (data.player == 2) {
			player2.name = data.name;
		}
		console.log('names', player1.name, player2.name);
		io.emit('returnUsers', {player1Name: player1.name, player2Name: player2.name});
	});
	
	socket.on('disconnection', function(socketID){ // The default 'disconnect' method doesn't seem to hold the socket.id
		if (player1.id == socketID) {
			player1.id = null;
			console.log('dis', player1.id, player2.id);
		} else if (player2.id == socketID) {
			player2.id = null;
			console.log('dis', player1.id, player2.id);
		}
	});
	socket.on('disconnect', function(socket){ // Check socketIDs here because the default 'disconnect' method doesn't contain the ID after the disconnect
		if (player1.id == null && player2.id == null){
			player1.score = 0;
			player2.score = 0;
		}  
  	});
	
	socket.on('score', function(data){
		if (player1.id == data.socketID && player1.score < data.target && player2.score < data.target){
			player1.score += 1;
		} else if (player2.id == data.socketID && player2.score < data.target && player1.score < data.target){
			player2.score += 1;
		} else {
			socket.emit('alert', 'You are observing');
			return;
		}
		updateScores();
	});
	
	socket.on('target', function(data){
		if (player1.id !== data.socketID && player2.id !== data.socketID){
			socket.emit('alert', 'Only players can update the target score');
			socket.emit('updateTarget', target);
			return;
		} else if (data.target < 1){
			socket.emit('alert',"Target score must be greater than 0");
			socket.emit('updateTarget', target);
			return;
		} else if (data.target <= player1.score || data.target <= player2.score) {
			socket.emit('alert',"Target score must be higher than both current scores");
			socket.emit('updateTarget', target);
			return;
		} else {
			io.emit('updateTarget', data.target)
		}
	});
	
	socket.on('reset', function(id){
		if (player1.id == id || player2.id == id){
			player1.score = 0;
			player2.score = 0;
			//player1.name = 'Player 1: ';
			//player2.name = 'Player 2: ';
			updateScores();
			io.emit('updateTarget', 21);
			//io.emit('returnUsers', {player1Name: player1.name, player2Name: player2.name});
		} else {
			socket.emit('alert', 'only players may reset');
		}
	});
	
	socket.on('tag', function(id){
		if (player1.id == id) {
			player1.id = null;
			io.emit('tagout', 1);
		}
		else if (player2.id == id) {
			player2.id = null; 
			io.emit('tagout', 2);
		}
		if (player1.id == null) {
			player1.id = id;
			socket.emit('tagin', id);				
		}
		else if (player2.if == null) {
			player2.id = id;
			socket.emit('tagin', id);
		}
	});
	socket.on('tagin', function(data){
		if (player1.id == data.id){
			player1.name = data.name;
		} else if (player2.id == data.id){
			player2.name = data.name;
		}
		io.emit('returnUsers', {player1Name: player1.name, player2Name: player2.name});
	});
});

server.listen(process.env.PORT || 3010, process.env.IP, function() {
	console.log('Server open');
});

// Methods
function updateScores() {
	io.emit('updateScores', {p1score: player1.score, p2score: player2.score})
}

function doclog(socket, msg) {
	socket.emit('log', {msg: msg});
}

function broadcast(socket, msg) {
	io.sockets.emit('broadcast',{description: `${msg}`})
}