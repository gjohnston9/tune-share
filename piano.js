/**
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
*/

var recorded_events = [];

(function() {
  /* Recording functionality */
  var recording = false;
  var seconds_elapsed = 0;
  var update_interval;

  var test_string = "3.57.208_2.57.297_3.56.238_2.56.315_3.55.218_2.55.269_3.56.197_2.56.295_3.57.197_2.57.255_3.57.206_2.57.317_3.57.218_2.57.1662_0.A4.69_1.A4.697_0.G4.100_1.G4.667_0.F4.99_1.F4.971_0.G4.44_1.G4.798_0.A4.99_1.A4.810_0.A4.100_1.A4.924_0.A4.99";

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
      var tune_string = events_to_string(recorded_events);
      document.getElementById("share-url").innerHTML = "The URL for your tune is [base-url]/" + tune_string;
      $("#share-url").show();

      document.getElementById("record-button").innerHTML = "Record";
      document.getElementById("clock").innerHTML = "0:00";
      clearInterval(update_interval);
      seconds_elapsed = 0;
    } else { // start recording
      recorded_events = [];
      update_interval = setInterval(clock_update, 1000);
      document.getElementById("record-button").innerHTML = "Stop Recording";
      $("#share-url").hide();
    }
    recording = !recording;
  }

  function play_note(event) {
    if (event["type"] == "mousedown") {
      console.log("triggering mousedown at piano key " + event["piano_key"]);
      $(pianoClass(event["piano_key"])).mousedown();
    }
    else if (event["type"] == "mouseup") {
      console.log("triggering mouseup at piano key " + event["piano_key"]);
      $(pianoClass(event["piano_key"])).mouseup();
    } else {
      // keydown or keyup
      console.log("triggering " + event["type"] + "; code is " + event["code"]);
      var press = $.Event(event["type"]);
      press.keyCode = event["code"];
      press.which = event["code"];
      $(document).trigger(press);
    }
  }

  function play_back_recursive(events_array) {
    var index = 0;
    var diff;
    function play_one() {
      if (index >= events_array.length) {
        return;
      }
      play_note(events_array[index]);
      diff = events_array[index]["difference"];
      console.log("waiting for " + diff + " milliseconds.");
      index++;
      setTimeout(play_one, diff);
    }
    play_one();
  }

  $(document).ready(function() {
      $("#toggle-display-button").click(function() {
        $("#recording-container").slideToggle();
      });

      $("#record-button").click(function() {
        record_toggle();
      });

      $("#playback-button").click(function() {
        var events = string_to_events(test_string); // test conversion from string to events
        console.log(events);
        play_back_recursive(events);
      })
  });

  /* Piano keyboard pitches. Names match sound files by ID attribute. */
  
  var keys =[
    'A2', 'Bb2', 'B2', 'C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3', 'Ab3',
    'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'Gb4', 'G4', 'Ab4',
    'A4', 'Bb4', 'B4', 'C5'
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
  var tonic = 'A2'; /* Lowest pitch. */
  
  /* Piano state. */
  
  var intervals = {};
  var depressed = {};
  
  /* Selectors */
  
  function pianoClass(name) {
    return '.piano-' + name;
  };
  
  function soundId(id) {
    return 'sound-' + id;
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
      'backgroundColor': '#88FFAA'
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
          'backgroundColor': 'black'
        }, 300, 'easeOutExpo');
      } else {
        $(pianoClass(key)).animate({
          'backgroundColor': 'white'
        }, 300, 'easeOutExpo');
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
        'backgroundColor': '#88FFAA'
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
      $(pianoClass('pedal')).addClass('piano-sustain');
    }
    console.log("\n\ncaptured keydown event. event is:");
    console.log(event);
    press(keydown(event.which));
  });
  
  $(document).keyup(function(event) {
    console.log("\n\ncaptured keyup event. event is:");
    console.log(event);
    if (event.which === pedal) {
      sustaining = false;
      $(pianoClass('pedal')).removeClass('piano-sustain');
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
    var string = "";
    var event, next, difference, code, event_num;
    for (var i = 0; i < events.length - 1; i++) {
      event = events[i]
      next = events[i+1]
      difference = Math.floor(next["timeStamp"] - event["timeStamp"]);
      event_num = event_type_to_num[event["type"]];
      if (event_num < 2) {
        // mouseup/mousedown
        code = event["piano_key"];
      } else {
        // keyup/keydown
        code = event["code"];
      }
      string += [event_num, code, difference].join(".");
      if (i < events.length - 2) {
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
      event = events_split[i];
      items = event.split(".")
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
          "code" : items[1],
          "difference" : items[2]
        });
      } 
    };
    return ret;
  }

})();
