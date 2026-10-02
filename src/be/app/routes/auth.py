import os
import re
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from flask import Blueprint, g, jsonify, request

from backend.app.db import get_db_connection
from app.security import require_user

auth_router = Blueprint("auth", __name__)


@auth_router.get("/me")
@require_user()
def current_user():
    user = g.current_user
    return jsonify({
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }
    })


@auth_router.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"error": "Dữ liệu gửi lên phải có định dạng JSON"}), 400

    full_name = data.get("full_name")
    email = data.get("email")
    password = data.get("password")
    if not isinstance(full_name, str) or not full_name.strip():
        return jsonify({"error": "Vui lòng nhập họ và tên"}), 400
    if not isinstance(email, str) or not email.strip():
        return jsonify({"error": "Vui lòng nhập email"}), 400
    if not isinstance(password, str) or len(password) < 6:
        return jsonify({"error": "Mật khẩu phải có ít nhất 6 ký tự"}), 400

    full_name = full_name.strip()
    email = email.strip().lower()
    if len(full_name) > 255 or len(email) > 255 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        return jsonify({"error": "Họ tên hoặc địa chỉ email không hợp lệ"}), 400
    if len(password.encode("utf-8")) > 72:
        return jsonify({"error": "Mật khẩu không được dài quá 72 byte"}), 400

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO users (id, name, email, password, role, status)
                   VALUES (%s, %s, %s, %s, 'user', 'active')
                   RETURNING id, name, email, role""",
                (str(uuid.uuid4()), full_name, email, password_hash),
            )
            user = cur.fetchone()
        conn.commit()
        return jsonify({
            "message": "Đăng ký tài khoản thành công",
            "user": user,
        }), 201
    except Exception as error:
        conn.rollback()
        if getattr(error, "pgcode", None) == "23505":
            return jsonify({"error": "Email này đã được đăng ký"}), 409
        raise
    finally:
        conn.close()


@auth_router.route("/login", methods=["POST"])
@auth_router.route("/signin", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"error": "Dữ liệu gửi lên phải có định dạng JSON"}), 400
    email = payload.get("email")
    password = payload.get("password")
    if not isinstance(email, str) or not isinstance(password, str) or not email or not password:
        return jsonify({"error": "Vui lòng nhập email và mật khẩu"}), 400

    secret = os.environ.get("JWT_SECRET")
    if not secret:
        return jsonify({"error": "Máy chủ chưa được cấu hình xác thực"}), 503

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, email, role, status, password FROM users WHERE email = %s",
                (email.strip().lower(),),
            )
            user = cur.fetchone()
        if not user or user["status"] != "active":
            return jsonify({"error": "Email hoặc mật khẩu không chính xác"}), 401
        try:
            password_matches = bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8"))
        except (ValueError, TypeError):
            password_matches = False
        if not password_matches:
            return jsonify({"error": "Email hoặc mật khẩu không chính xác"}), 401

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
            "token": token,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]},
        })
    finally:
        conn.close()
