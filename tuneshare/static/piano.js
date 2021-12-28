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
  // Recording functionality
  let recording = false;
  // Keeps track of events while recording
  let recordedEventsArray;
  // Holds string representing most recently recorded tune
  // (updated only when "Stop recording" is pressed)
  let recordedTuneString;
  // Interval that is created when recording starts, and cleared when
  // recording stops.
  let clockUpdateInterval;

  // If present, tune in url is parsed in $(document).ready below and
  // assigned to this variable
  let urlTuneString;
  // Length of key used for tune_string lookup in database
  const tuneKeyLength = 12;

  /**
   * Start incrementing the time shown in the clock element every second.
   */
  function startClock() {
    let secondsElapsed = 0;
    /**
     * Increment the seconds count, and update the clock.
     */
    function clockUpdate() {
      secondsElapsed++;
      const minutes = Math.floor(secondsElapsed / 60);
      const seconds = secondsElapsed % 60;
      const secondsString = String(seconds).padStart(2, '0');
      document.getElementById('clock').innerHTML =
        minutes + ':' + secondsString;
    }
    clockUpdateInterval = setInterval(clockUpdate, 1000);
  }

  /**
   * Stop the clock and reset it to 0.
   */
  function stopClock() {
    clearInterval(clockUpdateInterval);
    document.getElementById('clock').innerHTML = '0:00';
  }

  /**
   * Toggle "recording" on or off.
   * If this stops the recording, then send the recorded song to the backend,
   * and use the returned id to display a link to the song.
   * Otherwise, this starts the recording, setting "recording" to true so that
   * events will be recorded.
   */
  function recordToggle() {
    if (recording) { // stop recording
      recordedTuneString = eventsToString(recordedEventsArray);
      console.log('tune string: ' + recordedTuneString);

      $.ajax({
        type: 'POST',
        url: '/api/tune',
        data: JSON.stringify({tune_string: recordedTuneString}),
        contentType: 'application/json',
      }).done( function(data) {
        console.log('success!');
        const linkText =
          window.location.href + '?' + $.param({'tune': data.tune_id});
        document.getElementById('share-url').innerHTML =
          `The URL for your tune is <a href='` + linkText +
          `' target='newwindow'>` + linkText + '</a>';
        $('#share-url').show();

        document.getElementById('record-button').innerHTML = 'Record';
        document.getElementById('playback-recorded-button').disabled = false;
        stopClock();
        recording = false;
      }).fail( function() {
        console.log('failure...');
      }).always( function(data) {
        console.log(data);
      });

      // tunesTable.putItem(item_params, function(err, data) {
      //   if (err) {
      //     document.getElementById('share-url').innerHTML =
      //       'error creating URL: ' + err;
      //   }
      // });
    } else { // start recording
      recordedEventsArray = [];
      document.getElementById('record-button').innerHTML = 'Stop recording';
      document.getElementById('playback-recorded-button').disabled = true;
      $('#share-url').hide();
      startClock();
      recording = true;
    }
  }

  /**
   * Play a note.
   *
   * @param {Object} event - An event corresponding to a single key press (down
   *                         or up) or mouse click (down or up).
   */
  function playNote(event) {
    if (event['type'] == 'mousedown') {
      $(pianoClass(event['piano_key'])).mousedown();
    } else if (event['type'] == 'mouseup') {
      $(pianoClass(event['piano_key'])).mouseup();
    } else {
      // keydown or keyup
      const press = $.Event(event['type']); // eslint-disable-line new-cap
      press.keyCode = event['code'];
      press.which = event['code'];
      $(document).trigger(press);
    }
  }

  /**
   * Given an array of events, play them back, reproducing a song.
   *
   * @param {Array<Object>} eventsArray - An array of events to be played back.
   */
  function playBackEvents(eventsArray) {
    let index = 0;
    let diff;
    /**
     * Recursive helper function that plays back one event, then calls itself
     * to play the next event after waiting for the time between the original
     * two events.
     */
    function playOne() {
      if (index >= eventsArray.length) {
        // Reached the end of the events. Re-enable the playback buttons, after
        // a short delay.
        if (urlTuneString != null) {
          setTimeout(
              function() {
                document.getElementById(
                    'playback-url-button').disabled = false;
              },
              750,
          );
        }
        if (recordedTuneString != null) {
          setTimeout(
              function() {
                document.getElementById(
                    'playback-recorded-button').disabled = false;
              },
              750,
          );
        }
        return;
      }
      playNote(eventsArray[index]);
      diff = eventsArray[index]['difference'];
      index++;
      setTimeout(playOne, diff);
    }
    if (urlTuneString != null) {
      document.getElementById('playback-url-button').disabled = true;
    }
    if (recordedTuneString != null) {
      document.getElementById('playback-recorded-button').disabled = true;
    }
    playOne();
  }

  $(document).ready(function() {
    $('#toggle-display-button').click(function() {
      $('#recording-playback-container').slideToggle();
      $(this).text(
        $(this).text() == 'Hide recording/playback buttons' ?
          'Show recording/playback buttons' :
          'Hide recording/playback buttons');
    });

    $('#record-button').click(function() {
      recordToggle();
    });

    $('#playback-recorded-button').click(function() {
      const events = stringToEvents(recordedTuneString);
      playBackEvents(events);
    });

    $('#playback-url-button').click(function() {
      const events = stringToEvents(urlTuneString);
      playBackEvents(events);
    });

    document.getElementById('playback-recorded-button').disabled = true;
    document.getElementById('playback-url-button').disabled = true;

    // parse tune key from URL

    const re = new RegExp('tune=([a-zA-Z0-9]{' + tuneKeyLength + '})');
    const urlVars = window.location.search.substring(1);
    console.log('urlVars: ' + urlVars);
    const match = urlVars.match(re);
    if (match != null) {
      const tuneKeyMatch = match[1];
      console.log('match: ' + match);
      console.log('tuneKeyMatch: ' + tuneKeyMatch);

      const key = {
        Key: {
          tune_key: {S: tuneKeyMatch},
        },
      };

      console.log('looking up key');
      // TODO: this doesn't work anymore, replace with a request to the backend
      let tunesTable;
      tunesTable.getItem(key, function(err, data) {
        if (err) {
          console.log('error getting key: ' + err);
        } else {
          if ('Item' in data) {
            console.log('data: ');
            console.log(data);
            urlTuneString = data['Item']['tune_string']['S'];
            // TODO: make some indication on the page
            console.log('found urlTuneString');
            document.getElementById('playback-url-button').disabled = false;
          } else {
            // TODO: make some indication on the page
            console.log(`couldn't find urlTuneString...`);
          }
        }
      });
    } else {
      console.log('could not parse tune key from URL');
    }
  });

  /**
   * Make a random id with the given length.
   * Unused.
   * TODO: use id from the backend
   *
   * @param {number} numChars - Length of the id to make.
   * @return {string} A random id with the given length.
   */
  function makeId(numChars) { // eslint-disable-line no-unused-vars
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < numChars; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /* Piano keyboard pitches. Names match sound files by ID attribute. */

  const keys = [
    'A2', 'Bb2', 'B2', 'C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3', 'Ab3',
    'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'Gb4', 'G4', 'Ab4',
    'A4', 'Bb4', 'B4', 'C5',
  ];

  /* Corresponding keyboard keycodes, in order w/ 'keys'. */
  /* QWERTY layout:
  /*   upper register: Q -> P, with 1-0 as black keys. */
  /*   lower register: Z -> M, , with A-L as black keys. */

  const codes = [
    90, 83, 88, 67, 70, 86, 71, 66, 78, 74, 77, 75, 81, 50, 87, 69, 52, 82,
    53, 84, 89, 55, 85, 56, 73, 57, 79, 80,
  ];

  const pedal = 32; /* Keycode for sustain pedal. */
  const tonic = 'A2'; /* Lowest pitch. */

  /* Piano state. */

  const intervals = {};
  const depressed = {};

  /* Selectors */

  /**
   * Return the class of the given key.
   *
   * @param {string} name - Name of the key.
   * @return {string} The class of the key.
   */
  function pianoClass(name) {
    return '.piano-' + name;
  }

  /**
   * Return the sound element with the given id.
   *
   * @param {string} id - Id of the sound.
   * @return {HTMLElement} The DOM element for the sound.
   */
  function sound(id) {
    return document.getElementById('sound-' + id);
  }

  /* Virtual piano keyboard events. */

  /**
   * Returns a key with the given code.
   *
   * @param {number} code - The code of a key.
   * @return {number} The key with the given code.
   */
  function keyup(code) {
    const offset = codes.indexOf(code);
    if (offset >= 0) {
      const k = keys.indexOf(tonic) + offset;
      return keys[k];
    }
  }

  /**
   * Returns a key with the given code.
   *
   * @param {number} code - The code of a key.
   * @return {number} The key with the given code.
   */
  function keydown(code) {
    return keyup(code);
  }

  /**
   * Handle a keypress.
   *
   * @param {string} key - The id of a key.
   */
  function press(key) {
    const audio = sound(key);
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
      'backgroundColor': '#88FFAA',
    }, 0);
  }

  /**
   * Manually diminish the volume when the key is not sustained.
   * These values are hand-selected for a pleasant fade-out quality.
   *
   * @param {string} key - The id of a key.
   * @return {function} A function that clears any interval set on the key,
   *                    and then applies the interval from this function.
   */
  function fade(key) {
    const audio = sound(key);
    const stepfade = function() {
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
  }

  /**
   * Bring a key to an immediate halt.
   *
   * @param {string} key - The id of a key.
   * @return {function} A function that halts the key.
   */
  function kill(key) {
    const audio = sound(key);
    return function() {
      clearInterval(intervals[key]);
      if (audio) {
        audio.pause();
      }
      if (key.length > 2) {
        $(pianoClass(key)).animate({
          'backgroundColor': 'black',
        }, 300, 'easeOutExpo');
      } else {
        $(pianoClass(key)).animate({
          'backgroundColor': 'white',
        }, 300, 'easeOutExpo');
      }
    };
  }

  /* Simulate a gentle release, as opposed to hard stop. */

  const fadeout = true;

  /* Sustain pedal, toggled by user. */

  let sustaining = false;


  /* Register mouse event callbacks (for playing piano). */

  keys.forEach(function(key) {
    $(pianoClass(key)).mousedown(function() {
      $(pianoClass(key)).animate({
        'backgroundColor': '#88FFAA',
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
    press(keydown(event.which));
  });

  $(document).keyup(function(event) {
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
    $(pianoClass(key)).on('mousedown mouseup', function(event) {
      if (recording) {
        recordedEventsArray.push({
          'timeStamp': event.timeStamp,
          'type': event.type, // event.type is a string
          'piano_key': key,
        });
      }
    });
  });

  /* Register keyboard event callbacks (for recording events). */

  $(document).on('keyup keydown', function(event) {
    if (recording) {
      recordedEventsArray.push({
        'timeStamp': event.timeStamp,
        'type': event.type,
        'code': event.which,
      });
    }
  });


  /* For converting recorded events to a string, or the other way around */

  const eventTypeToNum = {
    'mousedown': 0,
    'mouseup': 1,
    'keyup': 2,
    'keydown': 3,
  };

  const numToEventType = {
    0: 'mousedown',
    1: 'mouseup',
    2: 'keyup',
    3: 'keydown',
  };

  /**
   * Convert an array of events to a string.
   *
   * @param {Array<Object>} events - The array of events to convert.
   * @return {string} A string that encodes all the events.
   */
  function eventsToString(events) {
    let singleEvent;
    let difference;
    let code;
    let eventNum;
    let string = '';

    for (let i = 0; i < events.length; i++) {
      singleEvent = events[i];
      if (i == events.length - 1) {
        difference = 0;
      } else {
        difference =
          Math.floor(events[i+1]['timeStamp'] - singleEvent['timeStamp']);
      }

      eventNum = eventTypeToNum[singleEvent['type']];
      if (eventNum < 2) {
        // mouseup/mousedown
        code = singleEvent['piano_key'];
      } else {
        // keyup/keydown
        code = singleEvent['code'];
      }
      string += [eventNum, code, difference].join('.');
      if (i < events.length - 1) {
        string += '_';
      }
    }
    return string;
  }

  /**
   * Convert a string of encoded events into an array of events.
   *
   * @param {string} eventsString - A string encoding a series of events.
   * @return {Array<Object>} An array of the events.
   */
  function stringToEvents(eventsString) {
    const ret = [];
    let items;
    const eventsSplit = eventsString.split('_');
    for (let i = 0; i < eventsSplit.length; i++) {
      items = eventsSplit[i].split('.');
      if (items[0] < 2) {
        // mouseup/mousedown
        ret.push({
          'type': numToEventType[items[0]],
          'piano_key': items[1],
          'difference': items[2],
        });
      } else {
        // keydown/keyup
        ret.push({
          'type': numToEventType[items[0]],
          'code': parseInt(items[1], 10),
          'difference': parseInt(items[2], 10),
        });
      }
    }
    return ret;
  }
})();
