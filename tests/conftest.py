import os
import tempfile
from dataclasses import dataclass
from typing import Generator

import pytest
from flask import Flask
from flask.testing import FlaskClient

from tuneshare import create_app
from tuneshare.models.db import init_db


@pytest.fixture
def app() -> Generator[Flask, None, None]:
    db_fd, db_path = tempfile.mkstemp()

    app = create_app({
        'TESTING': True,
        'DATABASE': db_path,
    })

    with app.app_context():
        init_db()

    yield app

    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()


@dataclass
class CreatedTune:
    tune_id: str
    tune_string: str


@pytest.fixture
def created_tune(client: FlaskClient) -> CreatedTune:
    tune_string = 'test-tune-string'
    post_response = client.post(
        '/api/tune',
        json={'tune_string': tune_string}
    )
    return CreatedTune(
        tune_id=post_response.json['tune_id'],
        tune_string=tune_string,
    )
