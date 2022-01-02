from datetime import datetime, timezone

import pytest
from flask import Flask
from flask.testing import FlaskClient
from werkzeug.wrappers.response import Response

from tuneshare.models.tune import NoSuchTuneException


def test_create_multiple_tunes(
    app: Flask,
    client: FlaskClient,
) -> None:
    """Verify that creating two tunes in a row works as expected."""
    test_tune_string = 'test-tune-string'
    test_tune_string2 = 'test-tune-string2'
    for tune_string in (test_tune_string, test_tune_string2):
        post_response = client.post(
            '/api/tune', json={'tune_string': tune_string})
        tune_id = post_response.json['tune_id']
        get_response = client.get(f'/api/tune/{tune_id}')
        validate_new_tune(
            get_response,
            expected_id=tune_id,
            expected_encoded_tune=tune_string,
        )


def validate_new_tune(
    get_response: Response,
    expected_id: str,
    expected_encoded_tune: str,
) -> None:
    data = get_response.json
    created_at_datetime = datetime.fromtimestamp(
        data['created_at'], tz=timezone.utc)
    assert data['tune_id'] == expected_id
    assert data['tune_string'] == expected_encoded_tune
    time_since_creation = datetime.now(tz=timezone.utc) - created_at_datetime
    assert time_since_creation.total_seconds() < 0.5


def test_get_nonexistent_tune(
    app: Flask,
    client: FlaskClient,
) -> None:
    """An exception should be raised when getting a tune that doesn't exist."""
    with pytest.raises(NoSuchTuneException):
        client.get('/api/tune/does_not_exist')
