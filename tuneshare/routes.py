from typing import Any, Mapping

from flask import Blueprint, render_template, request

from tuneshare.models.db import get_db
from tuneshare.models.tune import create_tune, get_tune

app_bp = Blueprint('tune', __name__)


@app_bp.get('/')
def serve() -> str:
    """Serve the html page."""
    return render_template('index.html')


@app_bp.get('/api/tune/<tune_id>')
def get_tune_by_id(tune_id: str) -> Mapping[str, Any]:
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


@app_bp.post('/api/tune')
def store_tune() -> Mapping[str, Any]:
    """Save the given tune and return the generated id."""
    assert request.json is not None, request.data
    tune_string = request.json['tune_string']
    db = get_db()
    tune_id = create_tune(db, tune_string)
    print(f'saved tune, id={tune_id}')
    return {
        'tune_id': tune_id,
    }
