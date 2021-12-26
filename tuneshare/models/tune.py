from sqlite3 import Connection


CREATE_SQL = '''
    INSERT INTO tune
    (encoded_tune)
    VALUES (?)
'''


def create_tune(db: Connection, tune_string: str) -> str:
    """Persist a new tune with the given string. Return the id."""
    c = db.cursor()
    c.execute(CREATE_SQL, (tune_string,))
    db.commit()
    return c.lastrowid
