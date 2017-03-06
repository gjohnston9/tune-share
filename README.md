tune-share
========

A simple Javascript piano, with the ability to record a tune and share it.

After you record a tune, an encoding of the tune is stored in a DynamoDB instance, along with an associated key. Then, a short URL containing that key is generated - if you give this URL to someone else, they can visit the page and click "Play tune from URL" to play back the same tune that you recorded.

available at https://github.gatech.edu/pages/gjohnston9/tune-share/

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