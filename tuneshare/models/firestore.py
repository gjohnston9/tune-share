import os
from typing import cast, Optional

import firebase_admin  # type: ignore
import firebase_admin.firestore  # type: ignore
from flask import g, Flask, current_app
from google.auth import credentials  # type: ignore
from google.cloud.firestore_v1 import Client  # type: ignore

from tuneshare import PROD_MODE_KEY

_FIRESTORE_CLIENT = 'firestore_client'


def init_app(app: Flask, prod_mode: bool = False) -> None:
    firebase_options = None
    if not prod_mode:
        os.environ['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080'
        firebase_options = {'projectId': 'dev'}

    firebase_app = firebase_admin.initialize_app(
        options=firebase_options,
    )
    print(
        "initialized firebase app with "
        f"name={firebase_app.name}, project_id={firebase_app.project_id}")
    app.teardown_appcontext(close_firestore_client)


def get_firestore_client() -> Client:
    if _FIRESTORE_CLIENT not in g:
        kwargs = {}
        # There doesn't seem to be any way to specify anonymous credentials
        # when initializing the firebase app above. So prod_mode needs to be
        # checked when creating the Firestore client.
        if not current_app.config[PROD_MODE_KEY]:
            kwargs['project'] = 'dev'
            kwargs['credentials'] = credentials.AnonymousCredentials()
        client = Client(**kwargs)
        setattr(g, _FIRESTORE_CLIENT, client)
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
