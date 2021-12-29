import os
from typing import Any, Mapping, Optional

from flask import Flask, redirect, request
from werkzeug import Response

from tuneshare.models import db
from tuneshare.routes import app_bp


def create_app(
    test_config: Mapping[str, Any] = None,
    prod_mode: bool = False,
) -> Flask:
    """
    Create and configure the app.

    :param test_config: Configuration to use for testing.
    :param prod_mode: Set to True when running on prod. Divergence between dev
                      and prod should be kept to a minimum. Right now it is
                      only used to generate a self-signed cert in dev mode.
    :return: The app, ready to run.
    """
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'tuneshare.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    if prod_mode:
        app.before_request(force_https)

    db.init_app(app)
    app.register_blueprint(app_bp)

    return app


def force_https() -> Optional[Response]:
    if not request.is_secure:
        return redirect(request.url.replace('http://', 'https://', 1))
    return None  # https://github.com/python/mypy/issues/3974
