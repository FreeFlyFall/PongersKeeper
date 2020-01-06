// Display data to subsequent sockets
// Add dropup to show settings which hold:
	// Reset button for active players
	// play button for watchers/watch button for players
	// so that watchers can jump in/ players can leave

// store target on server side so tab restores init it with proper value
// fix action buttom moving on feedback display update

var p1Display = document.getElementById('p1Display');
var p2Display = document.getElementById('p2Display');
var gtarget = document.getElementById('target');
var feedback = document.getElementById('feedback');
var prevScore = 21;
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
	let target = this.value;
	if (target < 1){
		feed("Target score must be greater than 0");
		this.value = prevScore;
	} else if (target <= getp1score() || target <= getp2score()) {
		feed("Target score must be higher than both current scores");
		this.value = prevScore;
	} else {
		socket.emit('target', {target: target, socketID: socket.id});
	}
}
// Server returns value to both players
socket.on('updateTarget', function(target) {
	if (target > getp1score() || target > getp2score()){
		p1Display.classList.remove("winner");
		p2Display.classList.remove("winner");
	}
	gtarget.value = target;
	prevScore = target;
});

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

// Reset
document.getElementById("reset").onclick = function() {
	socket.emit('reset', socket.id);
}

// Update feedback element and clear it after 4 seconds. Needs throttling/debouncing
function feed(string=''){
  feedback.textContent = string;
  setTimeout(function(){
    feedback.textContent = "";
  }, 4000)
}