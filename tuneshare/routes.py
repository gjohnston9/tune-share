from flask import Blueprint, render_template, request

from tuneshare.models.db import get_db
from tuneshare.models.tune import create_tune, get_tune

app_bp = Blueprint('tune', __name__)


@app_bp.route('/', methods=['GET'])
def serve():
    """Serve the html page."""
    return render_template('index.html')


@app_bp.route('/api/tune/<tune_id>', methods=['GET'])
def get_tune_by_id(tune_id: str):
    """Return the tune corresponding to the given id."""
    print(f'getting tune with id {tune_id}')
    db = get_db()
    # TODO: return a 404 if not found, would be 500 right now
    t = get_tune(db, tune_id)
    # TODO: update last-accessed-time
    # TODO: enable write-ahead-log so these updates don't lock the entire db
    return {
        'tune_id': tune_id,
        'tune_string': t.encoded_tune,
        'access_count': t.access_count,
    }


@app_bp.route('/api/tune', methods=['POST'])
def store_tune():
    """Save the given tune and return the generated id."""
    tune_string = request.json['tune_string']
    db = get_db()
    tune_id = create_tune(db, tune_string)
    print(f'saved tune, id={tune_id}')
    return {
        'tune_id': tune_id,
    }
