import os
from typing import cast, Optional

import firebase_admin  # type: ignore
import firebase_admin.firestore  # type: ignore
from flask import g, Flask
from google.cloud.firestore_v1 import Client

_FIRESTORE_CLIENT = 'firestore_client'


def init_app(app: Flask, prod_mode: bool = False) -> None:
    if not prod_mode:
        os.environ['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080'
        os.environ['GOOGLE_CLOUD_PROJECT'] = 'dev'

    firebase_app = firebase_admin.initialize_app()
    print(
        "initialized firebase app with "
        f"name={firebase_app.name}, project_id={firebase_app.project_id}")
    app.teardown_appcontext(close_firestore_client)


def get_firestore_client() -> Client:
    if _FIRESTORE_CLIENT not in g:
        setattr(g, _FIRESTORE_CLIENT, firebase_admin.firestore.client())
    return cast(Client, g.get(_FIRESTORE_CLIENT))


def close_firestore_client(_e: Optional[BaseException] = None) -> None:
    """
    Close the application context's firestore client.

    :param _e: exception (unused) that will be passed during application
               context teardown if there was an unhandled exception.
    """
    client = g.pop(_FIRESTORE_CLIENT, None)
    if client is not None:
        client.close()
