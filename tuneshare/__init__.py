import datetime
from typing import Any, Mapping, Optional

from flask import Flask, redirect, request
from werkzeug import Response

from tuneshare.constants import PROD_MODE_KEY
from tuneshare.models import firestore
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
    app = Flask(__name__)
    app.config.from_mapping({
        PROD_MODE_KEY: prod_mode,
        # Set the cache-control max age for static files
        'SEND_FILE_MAX_AGE_DEFAULT': datetime.timedelta(hours=6),
    })

    if test_config is not None:
        app.config.from_mapping(test_config)

    if prod_mode:
        app.before_request(force_https)

    firestore.init_app(app, prod_mode=prod_mode)
    app.register_blueprint(app_bp)

    return app


def force_https() -> Optional[Response]:
    if not request.is_secure:
        return redirect(request.url.replace('http://', 'https://', 1))
    return None  # https://github.com/python/mypy/issues/3974
