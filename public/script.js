// play button for watchers/watch button for players
// so that watchers can jump in/ players can leave

// Add server reset to separate dropup
// send current state on connection & update ui
// Fix switch in/out before working on gettings names to work

var p1Display = document.getElementById('p1Display');
var p2Display = document.getElementById('p2Display');
var p1Active = document.getElementById('p1Active');
var p2Active = document.getElementById('p2Active');
var gtarget = document.getElementById('target');
var feedback = document.getElementById('feedback');
var reset = document.getElementById('reset');

function getp1score() {
	return parseInt(p1Display.textContent);
}
function getp2score() {
	return parseInt(p2Display.textContent);
}

var socket = io.connect();
socket.on('alert', function (data) {
    feed(data);
});
socket.on('log', function (data) {
    console.log(data.msg);
});
socket.on('broadcast',function(data) {
  console.log(data.description);
});

// Get & display user names
socket.on('connector', function(data){
	var result = prompt('Enter username: ');
	if (data.player == 1) {
		if (result == '') {
			result = 'Player 1: '
		}
		p1Active.classList.add('activePlayer');
		socket.emit('setUser', {player: 1, name: result})
	}
	else if (data.player == 2) {
		if (result == '') {
			result = 'Player 2: '
		}
		p2Active.classList.add('activePlayer');
		socket.emit('setUser', {player: 2, name: result})
	}
});
socket.on('returnUsers', function(data){
	p1Active.textContent = data.player1Name;
	p2Active.textContent = data.player2Name;
})

// Increment your score by 1 if the score isn't at the target score
document.getElementById("submit").onclick = function() {
	let target = gtarget.value;
	socket.emit('score', {socketID: socket.id, target: target});
}
// Server return with updated scores to both players
socket.on('updateScores', function(data){
	p1Display.textContent = data.p1score;
	p2Display.textContent = data.p2score;
	let target = gtarget.value;
	if (data.p1score >= target) {
		displayWin('1');
	} else if (data.p2score >= target) {
		displayWin('2');
	}
});

// Update target score
gtarget.onchange = function() {
	socket.emit('target', {target: this.value, socketID: socket.id});
}
// Server returns value to both players
socket.on('updateTarget', function(target) {
	if (target > getp1score() || target > getp2score()){
		p1Display.classList.remove("winner");
		p2Display.classList.remove("winner");
	}
	gtarget.value = target;
});

// // Switch in/out
// document.getElementById('tag').onclick = function() {
// 	socket.emit('tag', socket.id);
// }
// socket.on('tagout', function(playerNum){
// 	if (playerNum == 1){
// 		p1Active.textContent = "Player 1: ";
// 	} else if (playerNum == 2){
// 		p2Active.textContent = "Player 2: ";
// 	}
// });
// socket.on('tagin', function(id){
// 	let result = prompt('Enter username: ');
// 	socket.emit('tagin', {id: socket.id, name: result});
// });

// Reset
document.getElementById("reset").onclick = function() {
	socket.emit('reset', socket.id);
}

// Custom disconnect method to send back socket.id
window.addEventListener('beforeunload', function (e) {
    socket.emit('disconnection', socket.id);
    delete e['returnValue'];
});




// Show winner
function displayWin(num){
	feed(`Player${num} wins`);
	document.getElementById(`p${num}Display`).classList.add("winner");
}

// Update feedback element and clear it after 4 seconds. Needs throttling/debouncing
function feed(string=''){
  feedback.textContent = string;
  setTimeout(function(){
    feedback.textContent = "";
  }, 4000)
}