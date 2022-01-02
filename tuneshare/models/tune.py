import datetime
import random
from dataclasses import dataclass

from google.cloud.firestore_v1 import Client, DocumentSnapshot

_TUNE_COLLECTION = 'tune'
_ID_LENGTH = 10
_ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"


@dataclass
class Tune:
    tune_id: str
    encoded_tune: str
    created_timestamp: datetime.datetime

    @staticmethod
    def from_firestore_doc(doc: DocumentSnapshot) -> 'Tune':
        """Create a Tune from a Firestore document snapshot."""
        return Tune(
            tune_id=doc.id,
            encoded_tune=doc.get('encoded_tune'),
            created_timestamp=doc.create_time,
        )


class NoSuchTuneException(Exception):
    pass


def _random_id() -> str:
    return "".join(random.choice(_ID_CHARS) for _ in range(_ID_LENGTH))


def create_tune(firestore_client: Client, tune_string: str) -> str:
    collection = firestore_client.collection(_TUNE_COLLECTION)
    doc_id = _random_id()
    _, doc_ref = collection.add(
        document_id=doc_id,
        document_data={
            'encoded_tune': tune_string,
        },
    )
    return doc_id


def get_tune(firestore_client: Client, tune_id: str) -> Tune:
    collection = firestore_client.collection(_TUNE_COLLECTION)
    doc_snapshot = collection.document(document_id=tune_id).get()
    if not doc_snapshot.exists:
        raise NoSuchTuneException
    return Tune.from_firestore_doc(doc_snapshot)
