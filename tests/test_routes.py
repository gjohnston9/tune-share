import datetime

from flask import Flask
from flask.testing import FlaskClient

from tuneshare.models.db import get_db
from tuneshare.models.tune import list_tunes, Tune


def test_create_tune_route(
    app: Flask,
    client: FlaskClient,
) -> None:
    test_tune_string = 'test-tune-string'
    response = client.post(
        '/',
        json={'tune_string': test_tune_string}
    )
    with app.app_context():
        db = get_db()
        results = list_tunes(db)
        assert len(results) == 1, results
        validate_new_tune(
            tune=results[0],
            expected_id=response.json['tune_id'],
            expected_encoded_tune=test_tune_string,
        )


def test_create_multiple_tunes(
    app: Flask,
    client: FlaskClient,
) -> None:
    test_tune_string = 'test-tune-string'
    test_tune_string2 = 'test-tune-string2'
    for i, tune_string in enumerate([test_tune_string, test_tune_string2], 1):
        response = client.post(
            '/',
            json={'tune_string': tune_string}
        )
        with app.app_context():
            db = get_db()
            results = list_tunes(db)
            # The first time, there will only be the first tune. The second
            # time, both tunes will appear in the results, and we want to
            # validate the second one (they are listed in ascending order of
            # creation time).
            assert len(results) == i, results
            validate_new_tune(
                tune=results[-1],
                expected_id=response.json['tune_id'],
                expected_encoded_tune=tune_string,
            )


def validate_new_tune(
    tune: Tune,
    expected_id: str,
    expected_encoded_tune: str,
) -> None:
    assert tune.tune_id == expected_id
    assert tune.encoded_tune == expected_encoded_tune
    assert tune.created_timestamp == tune.last_accessed_timestamp
    assert tune.access_count == 0
    time_since_creation = datetime.datetime.now() - tune.created_timestamp
    assert time_since_creation.total_seconds() < 1
