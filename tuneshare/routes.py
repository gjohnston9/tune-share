from flask import Blueprint, render_template, request

from tuneshare.models.db import get_db
from tuneshare.models.tune import create_tune

tune_bp = Blueprint('tune', __name__)


@tune_bp.route('/', methods=['GET'])
def serve():
    return render_template('index.html')


@tune_bp.route('/', methods=['POST'])
def store_tune():
    tune_string = request.json['tune_string']
    db = get_db()
    tune_id = create_tune(db, tune_string)
    return {
        'tune_id': tune_id,
    }
