import datetime
import sqlite3
from dataclasses import dataclass
from sqlite3 import Connection
from typing import List

CREATE_SQL = '''
    INSERT INTO tune
    (encoded_tune)
    VALUES (?)
'''

SELECT_ALL_SQL = '''
    SELECT *
    FROM tune
    ORDER BY created_timestamp ASC
'''


@dataclass
class Tune:
    tune_id: str
    encoded_tune: str
    created_timestamp: datetime.datetime
    last_accessed_timestamp: datetime.datetime
    access_count: int

    @staticmethod
    def from_db_row(row: sqlite3.Row) -> 'Tune':
        return Tune(
            tune_id=row['id'],
            encoded_tune=row['encoded_tune'],
            created_timestamp=row['created_timestamp'],
            last_accessed_timestamp=row['last_accessed_timestamp'],
            access_count=row['access_count'],
        )


def create_tune(db: Connection, tune_string: str) -> str:
    """Persist a new tune with the given string. Return the id."""
    c = db.cursor()
    c.execute(CREATE_SQL, (tune_string,))
    db.commit()
    return c.lastrowid


def list_tunes(db: Connection) -> List[Tune]:
    """List all tunes in the database, in ascending order of creation time."""
    c = db.cursor()
    results = c.execute(SELECT_ALL_SQL)
    return [Tune.from_db_row(row) for row in results]
