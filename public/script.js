// Reset button
// Revert score if changed to invalid value


var p1Display = document.getElementById('p1Display');
var p2Display = document.getElementById('p2Display');
var gtarget = document.getElementById('target');
var feedback = document.getElementById('feedback');
var prevScore = 21;

function getp1score() {
	return parseInt(p1Display.textContent);
}
function getp2score() {
	return parseInt(p2Display.textContent);
}

var socket = io.connect();
socket.on('alert', function (data) {
    alert(data.msg);
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
		feedback.textContent = "Target score must be greater than 0";
		this.value = prevScore;
		clearFeedbackElement();
	} else if (target <= getp1score() || target <= getp2score()) {
		feedback.textContent = "Target score must be higher than both current scores";
		this.value = prevScore;
		clearFeedbackElement();
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
	feedback.textContent = `Player${num} wins`;
	document.getElementById(`p${num}Display`).classList.add("winner");
	clearFeedbackElement();
}

// Clear feedback display after 4 seconds. Needs throttling/debouncing
function clearFeedbackElement(){
  setTimeout(function(){
    feedback.textContent = "";
  }, 4000)
}