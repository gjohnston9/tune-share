"""
Entrypoint for the app on Google App Engine.

Not used for local development.
"""

from tuneshare import create_app

app = create_app()
