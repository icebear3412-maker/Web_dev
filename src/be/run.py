import sys
from pathlib import Path

from flask import Flask
from flask_cors import CORS

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.routes.auth import auth_router
from app.routes.bookings import bookings_router
from app.routes.movies import movies_router
from app.routes.user import user_router

server = Flask(__name__)
CORS(server)

server.register_blueprint(auth_router, url_prefix="/auth")
server.register_blueprint(movies_router, url_prefix="/movies")
server.register_blueprint(bookings_router, url_prefix="/bookings")
server.register_blueprint(user_router, url_prefix="/user")

if __name__ == "__main__":
    server.run(host="localhost", port=5000, debug=True)
