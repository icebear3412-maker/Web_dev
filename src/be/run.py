import sys
from pathlib import Path
from datetime import date, datetime, time

from flask import Flask
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.routes.auth import auth_router
from app.routes.bookings import bookings_router
from app.routes.movie import movie_router
from app.routes.movies import movies_router
from app.routes.user import user_router

class CinemaJSONProvider(DefaultJSONProvider):
    @staticmethod
    def default(value):
        if isinstance(value, (date, datetime, time)):
            return value.isoformat()
        return DefaultJSONProvider.default(value)


server = Flask(__name__)
server.json = CinemaJSONProvider(server)
CORS(server)

server.register_blueprint(auth_router, url_prefix="/auth")
# Keep the admin CRUD API separate from both the public movie API and the
# frontend's /admin/movies page route.
server.register_blueprint(movie_router, url_prefix="/api/admin/movies")
server.register_blueprint(movies_router, url_prefix="/movies")
server.register_blueprint(bookings_router, url_prefix="/bookings")
server.register_blueprint(user_router, url_prefix="/user")

if __name__ == "__main__":
    server.run(host="localhost", port=5000, debug=True)
