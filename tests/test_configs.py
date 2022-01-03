"""Tests for the Flask app configuration."""

from flask import Flask

from tuneshare import PROD_MODE_KEY


def test_prod_mode(app: Flask) -> None:
    """Verify that the PROD_MODE config is False for tests."""
    assert PROD_MODE_KEY in app.config
    assert app.config.get(PROD_MODE_KEY) is False
    assert app.config[PROD_MODE_KEY] is False
