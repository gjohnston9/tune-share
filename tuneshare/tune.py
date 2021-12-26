from flask import Blueprint, render_template, request

tune_bp = Blueprint('tune', __name__)


@tune_bp.route('/', methods=['GET'])
def serve():
    return render_template('index.html')


@tune_bp.route('/', methods=['POST'])
def store_tune():
    # TODO: store in db
    return {
        "tune_id": "xyz", # TODO: use id from db
    }
