"""Tests for the endpoints exposed by the Flask app."""

from datetime import datetime, timezone

import pytest
from flask import Flask
from flask.testing import FlaskClient
from werkzeug.wrappers.response import Response

from tuneshare.models.tune import NoSuchTuneException


def test_get_nonexistent_tune(app: Flask, client: FlaskClient) -> None:
    """An exception should be raised when getting a tune that doesn't exist."""
    with pytest.raises(NoSuchTuneException):
        client.get('/api/tune/does_not_exist')


def test_create_multiple_tunes(
    app: Flask,
    client: FlaskClient,
) -> None:
    """Verify that creating two tunes in a row works as expected."""
    test_tune_string = 'test-tune-string'
    test_tune_string2 = 'test-tune-string2'
    for tune_string in (test_tune_string, test_tune_string2):
        # Save tune
        post_response = client.post(
            '/api/tune', json={'tune_string': tune_string})
        tune_id = post_response.json['tune_id']

        # Validate the tune that was just saved
        created_at_client_time = datetime.now(tz=timezone.utc)
        get_response = client.get(f'/api/tune/{tune_id}')
        validate_new_tune(
            get_response,
            expected_id=tune_id,
            expected_encoded_tune=tune_string,
            created_at_client_time=created_at_client_time,
        )


def validate_new_tune(
    get_response: Response,
    expected_id: str,
    expected_encoded_tune: str,
    created_at_client_time: datetime,
) -> None:
    data = get_response.json
    created_at_server_time = datetime.fromtimestamp(
        data['created_at'], tz=timezone.utc)
    assert data['tune_id'] == expected_id
    assert data['tune_string'] == expected_encoded_tune
    time_since_creation = created_at_client_time - created_at_server_time
    assert time_since_creation.total_seconds() < 0.5
