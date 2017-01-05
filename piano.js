/*
Old license (from forked project):
	Copyright 2012 Michael Morris-Pearce

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.

My license:
	Copyright 2016 Greg Johnston

	This file is part of tune-share.

	Tune-share is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program. If not, see <http://www.gnu.org/licenses/>.
*/


(function() {
  console.log("doing firebase things")
	firebase.auth().signInAnonymously();
	var tunes = database.ref("tunes");
	tunes.push("push this value!");

	/* Recording functionality */
	var recording = false;
	var seconds_elapsed = 0;
	var update_interval;

	var recorded_events = []; // keeps track of events while recording
	var recorded_tune_string = null; // holds string representing most recently recorded tune (updated only when "Stop recording" is pressed)

	// if present, tune in url is parsed in $(document).ready below and assigned to this variable
	var url_tune_string = null;

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
			recorded_tune_string = events_to_string(recorded_events);
      var link_text = window.location.href + "?" + $.param({"tune" : recorded_tune_string});
			document.getElementById("share-url").innerHTML = "The URL for your tune is <a href='" + link_text + "' target='newwindow'>" + link_text + "</a>";
			$("#share-url").show();

			document.getElementById("record-button").innerHTML = "Record";
			document.getElementById("playback-recorded-button").disabled = false;
			document.getElementById("clock").innerHTML = "0:00";
			clearInterval(update_interval);
			seconds_elapsed = 0;
		} else { // start recording
			recorded_events = [];
			update_interval = setInterval(clock_update, 1000);
			document.getElementById("record-button").innerHTML = "Stop Recording";
			document.getElementById("playback-recorded-button").disabled = true;
			$("#share-url").hide();
		}
		recording = !recording;
	}

	function play_note(event) {
		if (event["type"] == "mousedown") {
			$(pianoClass(event["piano_key"])).mousedown();
		}
		else if (event["type"] == "mouseup") {
			$(pianoClass(event["piano_key"])).mouseup();
		} else {
			// keydown or keyup
			var press = $.Event(event["type"]);
			press.keyCode = event["code"];
			press.which = event["code"];
			$(document).trigger(press);
		}
	}

	function play_back_recursive(events_array) {
		/* disable playback buttons, then
		play back notes in events_array, then
		enable playback buttons

		(have to reenable from inside this function, because of how
		setTimeout works) */
		var index = 0;
		var diff;
		function play_one() {
			if (index >= events_array.length) {
				if (url_tune_string != null) {
					setTimeout(function() { document.getElementById("playback-url-button").disabled = false; }, 750);
				}
				if (recorded_tune_string != null) {
					setTimeout(function() { document.getElementById("playback-recorded-button").disabled = false; }, 750);
				}				
				return;
			}
			play_note(events_array[index]);
			diff = events_array[index]["difference"];
			index++;
			setTimeout(play_one, diff);
		}
		if (url_tune_string != null) {
      document.getElementById("playback-url-button").disabled = true;
		}
		if (recorded_tune_string != null) {
      document.getElementById("playback-recorded-button").disabled = true;
		}
		play_one();
	}

	$(document).ready(function() {
			$("#toggle-display-button").click(function() {
				$("#recording-playback-container").slideToggle();
				$(this).text( $(this).text() == "Hide recording/playback buttons" ? "Show recording/playback buttons" : "Hide recording/playback buttons");
			});

			$("#record-button").click(function() {
				record_toggle();
			});

			$("#playback-recorded-button").click(function() {
				var events = string_to_events(recorded_tune_string);
				play_back_recursive(events);
			})

			$("#playback-url-button").click(function() {
				var events = string_to_events(url_tune_string);
				play_back_recursive(events);
			})

			document.getElementById("playback-recorded-button").disabled = true;

			var regex = /tune=([\w\._]+)/;
			var url_vars = window.location.search.substring(1);
			console.log("url_vars: " + url_vars);
			var match = url_vars.match(regex);
			if (match != null) {
				url_tune_string = match[1];
				console.log("parsed tune string: " + url_tune_string);
				document.getElementById("playback-url-button").disabled = false;
			} else {
				document.getElementById("playback-url-button").disabled = true;
			}
	});

	/* Piano keyboard pitches. Names match sound files by ID attribute. */
	
	var keys =[
		"A2", "Bb2", "B2", "C3", "Db3", "D3", "Eb3", "E3", "F3", "Gb3", "G3", "Ab3",
		"A3", "Bb3", "B3", "C4", "Db4", "D4", "Eb4", "E4", "F4", "Gb4", "G4", "Ab4",
		"A4", "Bb4", "B4", "C5"
	];

	/* Corresponding keyboard keycodes, in order w/ 'keys'. */
	/* QWERTY layout:
	/*   upper register: Q -> P, with 1-0 as black keys. */
	/*   lower register: Z -> M, , with A-L as black keys. */
	
	var codes = [
		 90,   83,    88,   67,   70,    86,   71,    66,   78,   74,    77,   75,
		 81,   50,    87,   69,   52,    82,   53,    84,   89,   55,    85,   56,
		 73,   57,    79,   80
	];
	
	var pedal = 32; /* Keycode for sustain pedal. */
	var tonic = "A2"; /* Lowest pitch. */
	
	/* Piano state. */
	
	var intervals = {};
	var depressed = {};
	
	/* Selectors */
	
	function pianoClass(name) {
		return ".piano-" + name;
	};
	
	function soundId(id) {
		return "sound-" + id;
	};
	
	function sound(id) {
		var it = document.getElementById(soundId(id));
		return it;
	};

	/* Virtual piano keyboard events. */
	
	function keyup(code) {
		var offset = codes.indexOf(code);
		var k;
		if (offset >= 0) {
			k = keys.indexOf(tonic) + offset;
			return keys[k];
		}
	};
	
	function keydown(code) {
		return keyup(code);
	};
	
	function press(key) {
		var audio = sound(key);
		if (depressed[key]) {
			return;
		}
		clearInterval(intervals[key]);
		if (audio) {
			audio.pause();
			audio.volume = 1.0;
			if (audio.readyState >= 2) {
				audio.currentTime = 0;
				audio.play();
				depressed[key] = true;
			}
		}
		$(pianoClass(key)).animate({
			"backgroundColor": "#88FFAA"
		}, 0);
	};

	/* Manually diminish the volume when the key is not sustained. */
	/* These values are hand-selected for a pleasant fade-out quality. */
	
	function fade(key) {
		var audio = sound(key);
		var stepfade = function() {
			if (audio) {
				if (audio.volume < 0.03) {
					kill(key)();
				} else {
					if (audio.volume > 0.2) {
						audio.volume = audio.volume * 0.95;
					} else {
						audio.volume = audio.volume - 0.01;
					}
				}
			}
		};
		return function() {
			clearInterval(intervals[key]);
			intervals[key] = setInterval(stepfade, 5);
		};
	};

	/* Bring a key to an immediate halt. */
	
	function kill(key) {
		var audio = sound(key);
		return function() {
			clearInterval(intervals[key]);
			if (audio) {
				audio.pause();
			}
			if (key.length > 2) {
				$(pianoClass(key)).animate({
					"backgroundColor": "black"
				}, 300, "easeOutExpo");
			} else {
				$(pianoClass(key)).animate({
					"backgroundColor": "white"
				}, 300, "easeOutExpo");
			}
		};
	};

	/* Simulate a gentle release, as opposed to hard stop. */
	
	var fadeout = true;

	/* Sustain pedal, toggled by user. */
	
	var sustaining = false;



	/* Register mouse event callbacks (for playing piano). */
	
	keys.forEach(function(key) {
		$(pianoClass(key)).mousedown(function() {
			$(pianoClass(key)).animate({
				"backgroundColor": "#88FFAA"
			}, 0);
			press(key);
		});
		if (fadeout) {
			$(pianoClass(key)).mouseup(function() {
				depressed[key] = false;
				if (!sustaining) {
					fade(key)();
				}
			});
		} else {
			$(pianoClass(key)).mouseup(function() {
				depressed[key] = false;
				if (!sustaining) {
					kill(key)();
				}
			});
		}
	});

	/* Register keyboard event callbacks (for playing piano). */
	
	$(document).keydown(function(event) {
		if (event.which === pedal) {
			sustaining = true;
			$(pianoClass("pedal")).addClass("piano-sustain");
		}
		press(keydown(event.which));
	});
	
	$(document).keyup(function(event) {
		if (event.which === pedal) {
			sustaining = false;
			$(pianoClass("pedal")).removeClass("piano-sustain");
			Object.keys(depressed).forEach(function(key) {
				if (!depressed[key]) {
					if (fadeout) {
						fade(key)();
					} else {
						kill(key)();
					}
				}
			});
		}
		if (keyup(event.which)) {
			depressed[keyup(event.which)] = false;
			if (!sustaining) {
				if (fadeout) {
					fade(keyup(event.which))();
				} else {
					kill(keyup(event.which))();
				}
			}
		}
	});



	/* Register mouse event callbacks (for recording events). */

	keys.forEach(function(key) {
		$(pianoClass(key)).on("mousedown mouseup", function(event) {
			if (recording) {
				recorded_events.push(
					{"timeStamp" : event.timeStamp,
					"type" : event.type, // event.type is a string
					"piano_key" : key}
				);
			}
		});
	});

	/* Register keyboard event callbacks (for recording events). */

	$(document).on("keyup keydown", function(event) {
		if (recording) {
			recorded_events.push(
				{"timeStamp" : event.timeStamp,
				"type" : event.type,
				"code" : event.which}
			);
		}
	});



	/* For converting recorded events to a string, or the other way around */

	var event_type_to_num = {
		"mousedown" : 0,
		"mouseup" : 1,
		"keyup" : 2,
		"keydown" : 3
	}

	var num_to_event_type = {
		0 : "mousedown",
		1 : "mouseup",
		2 : "keyup",
		3 : "keydown"
	}

	function events_to_string(events) {
		var single_event, difference, code, event_num;
		var string = "";

		for (var i = 0; i < events.length; i++) {
			single_event = events[i];
			if (i == events.length - 1) {
				difference = 0;
			} else {
				difference = Math.floor(events[i+1]["timeStamp"] - single_event["timeStamp"]);  
			}
			
			event_num = event_type_to_num[single_event["type"]];
			if (event_num < 2) {
				// mouseup/mousedown
				code = single_event["piano_key"];
			} else {
				// keyup/keydown
				code = single_event["code"];
			}
			string += [event_num, code, difference].join(".");
			if (i < events.length - 1) {
				string += "_";
			}
		};
		return string;
	}

	function string_to_events(events_string) {
		var ret = [];
		var items;
		var events_split = events_string.split("_");
		for (var i = 0; i < events_split.length; i++) {
			items = events_split[i].split(".")
			if (items[0] < 2) {
				// mouseup/mousedown
				ret.push({
					"type" : num_to_event_type[items[0]],
					"piano_key" : items[1],
					"difference" : items[2]
				});     
			} else {
				// keydown/keyup
				ret.push({
					"type" : num_to_event_type[items[0]],
					"code" : parseInt(items[1], 10),
					"difference" : parseInt(items[2], 10)
				});
			} 
		};
		return ret;
	}

})();
