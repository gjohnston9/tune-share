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

SELECT_ONE_SQL = '''
    SELECT *
    FROM tune
    WHERE id = ?
'''

SELECT_ALL_SQL = '''
    SELECT *
    FROM tune
    ORDER BY created_timestamp ASC
'''


class NoSuchTuneException(Exception):
    pass


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
            # TODO: the "tune id" should be a string based on the number id
            #  from the db
            tune_id=str(row['id']),
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


def get_tune(db: Connection, tune_id: str) -> Tune:
    """
    Fetches the tune with the given id from the database, and returns it.

    Throws a NoSuchTuneException if no tune exists with the id.
    """
    c = db.cursor()
    results = c.execute(SELECT_ONE_SQL, (tune_id,))
    results = list(results)
    if len(results) == 0:
        raise NoSuchTuneException
    if len(results) > 1:
        # Should never happen, since id is the only key
        raise Exception(f'unexpected number of results: {len(results)}')
    return Tune.from_db_row(results[0])


def list_tunes(db: Connection) -> List[Tune]:
    """List all tunes in the database, in ascending order of creation time."""
    c = db.cursor()
    results = c.execute(SELECT_ALL_SQL)
    return [Tune.from_db_row(row) for row in results]
