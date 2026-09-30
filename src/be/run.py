from flask import Flask
from flask_cors import CORS

#imports the database function .
from app.database import init_db
from app.routes.auth import auth_router

server = Flask(__name__)
CORS(server)

init_db()

server.register_blueprint(auth_router, url_prefix="/auth")

if __name__ == "__main__":
    server.run(host="localhost", port=5000, debug=True)