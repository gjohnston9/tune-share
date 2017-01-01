tune-share
========

A simple Javascript piano, with the ability to record a tune and share it.

Tunes are currently shared by creating a URL that directly encodes whichever tune was just recorded. In the future, a Firebase database will be used instead, so a short URL will be generated that corresponds to an entry in the database.

Features:

* 28 keys, A2-C5 chromatic.
* 16-bit, 44.1 KHz Steinway samples.
* Per-key sustain, plus a sustain pedal.
* 100% HTML/Javascript.

Known Issues:

* Pressing keys in quick succession with the mouse sometimes causes some keys to become stuck in a pressed position.
* Most audio mixers act strangely when many sounds are played simultaneously (around 10).
* Some audio mixers (e.g. Pulse Audio) are known to have bugs concerning HTML5 audio as of this writing.

Ogg-format audio samples are known to work in Firefox and Chrome.

Samples are provided by the University of Iowa's Electronic Music Studio:
http://theremin.music.uiowa.edu/MISpiano.html