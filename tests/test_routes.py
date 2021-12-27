from tuneshare.models.db import get_db


def test_create_tune_route(
    app,
    client,
) -> None:
    test_tune_string = 'test-tune-string'
    response = client.post(
        '/',
        json={'tune_string': test_tune_string}
    )
    with app.app_context():
        db = get_db()
        result = db.execute('SELECT * FROM tune ORDER BY created_timestamp ASC')
        items = list(result)
        assert len(items) == 1, items
        assert items[0]['encoded_tune'] == test_tune_string
        assert items[0]['id'] == response.json['tune_id']
