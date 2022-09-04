# tune-share

[![build-master](https://github.com/gjohnston9/tune-share/actions/workflows/build-master.yml/badge.svg?branch=master)](https://github.com/gjohnston9/tune-share/actions/workflows/build-master.yml)

A Flask web app with a simple Javascript piano, with the ability to record a tune and share it.

Try it out at https://tune-share.app!

After you record a tune, an encoding of the tune is stored in a database, along with an associated key. Then, a short URL containing that key is generated - if you give this URL to someone else, they can visit the page and click "Play tune from URL" to play back the same tune that you recorded.

## Setup
All of these steps should be run from the root of the project.
### Frontend
Setup for working on the frontend:
```
# Install node, if you don't have it already (from https://askubuntu.com/a/1009527)
sudo apt purge nodejs npm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
nvm install node --lts

# Install the dependencies of this project (note that this includes a recent version of node; you might want to exclude it if you're happy with your version of node already)
npm install
```

### Backend
Setup for running the app or working on the backend:
```
# Create a Python virtual environment, installed in the "venv" directory
python3.8 -m venv venv/

# Activate the venv
source venv/bin/activate

# Install the packages needed for this project
pip install -r requirements.txt

# Download the Firebase binary, for running Firestore emulator for local development/tests
wget -O firebase https://github.com/firebase/firebase-tools/releases/download/v10.0.1/firebase-tools-linux
chmod +x firebase
./firebase setup:emulators:firestore
```

### Deployment
Setup for deploying to Google Cloud:

Install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install

Install Terraform: https://learn.hashicorp.com/tutorials/terraform/install-cli

Then run these commands:
```
gcloud components install app-engine-python
gcloud auth application-default login
terraform init
```

## Development
### Frontend
#### Linting
The settings from `.eslintrc.json` will be used:
```
npm run lint
```

### Backend
#### Linting
flake8 will pick up settings from `setup.cfg`:
```
flake8
```
#### Testing
To run tests, from the root of the project:
```
# Start the Firestore emulator (run in another terminal window)
./firebase emulators:start --only firestore --project dev

PYTHONPATH=. pytest
```


### Running the app
From the root of the project:
```
# Set up environment variables
export FLASK_APP=tuneshare
export FLASK_ENV=development

# Start the Firestore emulator (run in another terminal window)
./firebase emulators:start --only firestore --project dev

# Run the application
flask run
```

## Deployment
```
# Create the GCP project etc. Note that if you have already created some of
# these resources in the UI, you will need to import them with Terraform, e.g.
# `terraform import google_project.tune_share_project <id-of-project>`.
terraform plan   # preview changes
terraform apply  # make changes

gcloud app deploy
gcloud app browse  # open the running app in your browser
```

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
