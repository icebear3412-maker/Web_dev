from flask import Blueprint

auth_router = Blueprint("auth", __name__)


@auth_router.route("/login", methods=["POST"])
def login():
    return {"message": "Login"}