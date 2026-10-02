import os
from functools import wraps

import jwt
from flask import g, jsonify, request

from backend.app.db import get_db_connection


ADMIN_ACCOUNT_EMAIL = "admin@gmail.com"


def require_user(admin_only=False):
    """Load the active user from a verified bearer access token."""
    def decorator(handler):
        @wraps(handler)
        def wrapped(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            scheme, _, token = auth_header.partition(" ")
            secret = os.environ.get("JWT_SECRET")
            if scheme.lower() != "bearer" or not token or not secret:
                return jsonify({"error": "Authentication required"}), 401
            try:
                claims = jwt.decode(token, secret, algorithms=["HS256"])
            except jwt.PyJWTError:
                return jsonify({"error": "Invalid or expired access token"}), 401

            user_id = claims.get("sub")
            if not user_id:
                return jsonify({"error": "Invalid access token"}), 401

            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT id, name, email, role, status FROM users WHERE id = %s",
                        (user_id,),
                    )
                    user = cur.fetchone()
                if not user or user["status"] != "active":
                    return jsonify({"error": "Account is unavailable"}), 403
                if admin_only and (
                    user["role"] != "admin"
                    or user["email"].strip().lower() != ADMIN_ACCOUNT_EMAIL
                ):
                    return jsonify({"error": "Administrator access required"}), 403
                g.current_user = user
            finally:
                conn.close()
            return handler(*args, **kwargs)

        return wrapped

    return decorator
