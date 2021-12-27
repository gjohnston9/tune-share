# tune-share

A Flask web app with a simple Javascript piano, with the ability to record a tune and share it.

After you record a tune, an encoding of the tune is stored in a database, along with an associated key. Then, a short URL containing that key is generated - if you give this URL to someone else, they can visit the page and click "Play tune from URL" to play back the same tune that you recorded.

## Setup
Run these steps from the root of the project:
```
# Create a Python virtual environment, installed in the "venv" directory
$ python -m venv venv/

# Activate the venv
$ source venv/bin/activate

# Install the packages needed for this project
$ pip install -r requirements.txt
```

## Running the app
From the root of the project:
```
# Set up environment variables
export FLASK_APP=tuneshare
export FLASK_ENV=development

# Set up the database
flask init-db

# Run the application
flask run
```

## Tests
From the root of the project, run `PYTHONPATH=. pytest`. Append `--capture=no` to see output as it is printed.

## Piano details
### Features
* 28 keys, A2-C5 chromatic.
* 16-bit, 44.1 KHz Steinway samples.
* Per-key sustain, plus a sustain pedal.
* 100% HTML/Javascript.

### Known Issues
* Pressing keys in quick succession with the mouse sometimes causes some keys to become stuck in a pressed position.
* Most audio mixers act strangely when many sounds are played simultaneously (around 10).
* Some audio mixers (e.g. Pulse Audio) are known to have bugs concerning HTML5 audio as of this writing.

Ogg-format audio samples are known to work in Firefox and Chrome.

Samples are provided by the University of Iowa's Electronic Music Studio:
http://theremin.music.uiowa.edu/MISpiano.html