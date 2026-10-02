from flask import Blueprint, g, jsonify, request

from app.security import require_user
from backend.app.db import get_db_connection

user_router = Blueprint("user", __name__)


def _profile_data(user):
    return {
        "id": user["id"],
        "full_name": user["name"],
        "email": user["email"],
    }


@user_router.route("/profile", methods=["GET"])
@require_user()
def get_profile():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, email FROM users WHERE id = %s",
                (g.current_user["id"],),
            )
            user = cur.fetchone()
        if not user:
            return jsonify({"error": "Không tìm thấy tài khoản"}), 404
        return jsonify({"status": "success", "data": _profile_data(user)})
    finally:
        conn.close()

@user_router.route("/profile", methods=["PUT"])
@require_user()
def update_profile():
    data = request.get_json(silent=True) or {}
    full_name = data.get("fullName") if isinstance(data, dict) else None
    if not isinstance(full_name, str) or not full_name.strip():
        return jsonify({"error": "Vui lòng nhập họ và tên"}), 400
    full_name = full_name.strip()
    if len(full_name) > 255:
        return jsonify({"error": "Họ và tên không được vượt quá 255 ký tự"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE users SET name = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s RETURNING id, name, email""",
                (full_name, g.current_user["id"]),
            )
            user = cur.fetchone()
        if not user:
            conn.rollback()
            return jsonify({"error": "Không tìm thấy tài khoản"}), 404
        conn.commit()
        return jsonify({
            "message": "Đã cập nhật thông tin tài khoản",
            "data": _profile_data(user),
        })
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
