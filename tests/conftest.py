from typing import Generator

import firebase_admin  # type: ignore
import pytest
from flask import Flask
from flask.testing import FlaskClient

from tuneshare import create_app
from tuneshare.models.firestore import get_firestore_client
from tuneshare.models.tune import _TUNE_COLLECTION


@pytest.fixture
def app() -> Generator[Flask, None, None]:
    app = create_app(
        test_config={
            'TESTING': True
        },
    )
    yield app

    with app.app_context():
        # Clean up Firestore contents
        firestore_client = get_firestore_client()
        c = firestore_client.collection(_TUNE_COLLECTION)
        for doc in c.stream():
            doc.reference.delete()

    # Clean up the firebase app setup
    firebase_app = firebase_admin.get_app()
    firebase_admin.delete_app(firebase_app)


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()
