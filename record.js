var recording = false;
var seconds_elapsed = 0;
var update_interval;

function clock_update() {
	var minutes, seconds;
	if (recording) {
		seconds_elapsed++;
		minutes = Math.floor(seconds_elapsed / 60);
		seconds = seconds_elapsed % 60;
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		document.getElementById("clock").innerHTML = minutes + ":" + seconds;
	}
}

function record_toggle() {
	if (recording) { // stop recording
		document.getElementById("record-button").innerHTML = "Record";
		document.getElementById("clock").innerHTML = "0:00";
		clearInterval(update_interval);
		seconds_elapsed = 0;
	} else { // start recording
		update_interval = setInterval(clock_update, 1000);
		document.getElementById("record-button").innerHTML = "Stop Recording";
	}
	recording = !recording;
}

$(document).ready(function () {
	$("#toggle-display-button").click(function() {
		console.log("toggling recording-container");
		$("#recording-container").slideToggle();
	});
});