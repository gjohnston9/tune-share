from flask import Blueprint, render_template

tune_bp = Blueprint('tune', __name__)


@tune_bp.route('/', methods=['GET'])
def serve():
    return render_template('index.html')
