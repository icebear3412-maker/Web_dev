import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from flask import Blueprint, jsonify, request

from backend.app.db import get_db_connection

auth_router = Blueprint("auth", __name__)


@auth_router.route("/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"error": "A JSON object is required"}), 400
    email = payload.get("email")
    password = payload.get("password")
    if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    secret = os.environ.get("JWT_SECRET")
    if not secret:
        return jsonify({"error": "Authentication is not configured"}), 503

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, email, role, status, password FROM users WHERE email = %s",
                (email.strip().lower(),),
            )
            user = cur.fetchone()
        if not user or user["status"] != "active":
            return jsonify({"error": "Invalid email or password"}), 401
        try:
            password_matches = bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8"))
        except (ValueError, TypeError):
            password_matches = False
        if not password_matches:
            return jsonify({"error": "Invalid email or password"}), 401

        now = datetime.now(timezone.utc)
        expires_in = 1800
        token = jwt.encode(
            {"sub": user["id"], "iat": now, "exp": now + timedelta(seconds=expires_in)},
            secret,
            algorithm="HS256",
        )
        return jsonify({
            "access_token": token,
            "token_type": "Bearer",
            "expires_in": expires_in,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]},
        })
    finally:
        conn.close()
