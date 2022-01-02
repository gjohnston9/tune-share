from typing import Any, Dict

from flask import Blueprint, render_template, request

from tuneshare.models.firestore import get_firestore_client
from tuneshare.models.tune import create_tune, get_tune

app_bp = Blueprint('tune', __name__)


@app_bp.get('/')
def serve() -> str:
    """Serve the html page."""
    return render_template('index.html')


@app_bp.get('/api/tune/<tune_id>')
def get_tune_by_id(tune_id: str) -> Dict[str, Any]:
    """Return the tune corresponding to the given id."""
    print(f'getting tune with id {tune_id}')
    # TODO: return a 404 if not found, would be 500 right now
    client = get_firestore_client()
    t = get_tune(client, tune_id)
    t.created_timestamp.timestamp()
    return {
        'tune_id': tune_id,
        'tune_string': t.encoded_tune,
        'created_at': t.created_timestamp.timestamp(),  # seconds since epoch
    }


@app_bp.post('/api/tune')
def store_tune() -> Dict[str, Any]:
    """Save the given tune and return the generated id."""
    assert request.json is not None, request.data
    tune_string = request.json['tune_string']
    client = get_firestore_client()
    tune_id = create_tune(client, tune_string)
    print(f'saved tune, id={tune_id}')
    return {
        'tune_id': tune_id,
    }
