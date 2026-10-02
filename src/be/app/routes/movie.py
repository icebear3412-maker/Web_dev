from uuid import uuid4

from flask import Blueprint, jsonify, request

from app.db import get_db_connection
from app.security import require_user


movie_router = Blueprint("movie", __name__)


def _serialize_date_or_time(value):
    """Return PostgreSQL date/time values consistently as JSON strings."""
    if value is None:
        return ""
    return value.isoformat() if hasattr(value, "isoformat") else str(value)


def movie_to_json(row):
    return {
        "id": str(row["id"]),
        "title": row["title"],
        "genre": row["genre"] or "",
        "duration": row["duration"] or "",
        "release_date": row["release_date"] or "",
        "poster": row["poster"] or "",
        "trailer_url": row["trailer_url"] or "",
        "description": row["synopsis"] or "",
        "status": "Showing"
        if str(row["status"]).lower() == "showing"
        else "Hidden",
    }


@movie_router.route("", methods=["GET"])
@require_user(admin_only=True)
def get_movies():
    conn = get_db_connection()

    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, title, genre, duration, release_date,
                   poster, trailer_url, synopsis, status
            FROM movies
            ORDER BY title
        """)

        return jsonify([movie_to_json(row) for row in cur.fetchall()])
    finally:
        conn.close()


@movie_router.route("", methods=["POST"])
@require_user(admin_only=True)
def create_movie():
    data = request.get_json() or {}

    title = str(data.get("title", "")).strip()

    if not title:
        return jsonify({"error": "Vui lòng nhập tên phim"}), 400

    status = str(data.get("status", "showing")).lower()

    if status not in {"showing", "hidden"}:
        return jsonify({"error": "Trạng thái phim không hợp lệ"}), 400

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO movies (
                id, title, genre, duration, release_date,
                poster, trailer_url, synopsis, status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, title, genre, duration, release_date,
                      poster, trailer_url, synopsis, status
        """, (
            str(uuid4()),
            title,
            data.get("genre", ""),
            str(data.get("duration", "")),
            str(data.get("release_date", "")),
            data.get("poster", ""),
            data.get("trailer_url", ""),
            data.get("description", ""),
            status,
        ))

        movie = cur.fetchone()
        conn.commit()

        return jsonify(movie_to_json(movie)), 201

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@movie_router.route("/<movie_id>", methods=["PATCH"])
@require_user(admin_only=True)
def update_movie(movie_id):
    data = request.get_json() or {}

    mapping = {
        "title": "title",
        "genre": "genre",
        "duration": "duration",
        "release_date": "release_date",
        "poster": "poster",
        "trailer_url": "trailer_url",
        "description": "synopsis",
        "status": "status",
    }

    fields = []
    values = []

    for key, column in mapping.items():
        if key not in data:
            continue

        value = data[key]

        if key == "status":
            value = str(value).lower()

            if value not in {"showing", "hidden"}:
                return jsonify({"error": "Trạng thái phim không hợp lệ"}), 400

        if key in {"duration", "release_date"}:
            value = str(value)

        fields.append(f"{column} = %s")
        values.append(value)

    if not fields:
        return jsonify({"error": "Không có thông tin nào để cập nhật"}), 400

    values.append(movie_id)

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            f"""
            UPDATE movies
            SET {", ".join(fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, title, genre, duration, release_date,
                      poster, trailer_url, synopsis, status
            """,
            values,
        )

        movie = cur.fetchone()

        if movie is None:
            conn.rollback()
            return jsonify({"error": "Không tìm thấy phim"}), 404

        conn.commit()

        return jsonify(movie_to_json(movie))

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@movie_router.route("/<movie_id>", methods=["DELETE"])
@require_user(admin_only=True)
def delete_movie(movie_id):
    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            DELETE FROM movies
            WHERE id = %s
            RETURNING id
            """,
            (movie_id,),
        )

        movie = cur.fetchone()

        if movie is None:
            conn.rollback()
            return jsonify({"error": "Không tìm thấy phim"}), 404

        conn.commit()

        return jsonify({
            "id": str(movie["id"]),
            "message": "Đã xóa phim",
        })

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@movie_router.route("/rooms", methods=["GET"])
@require_user(admin_only=True)
def get_rooms():
    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT room_number, name, type
            FROM cinema_rooms
            ORDER BY room_number
        """)

        return jsonify([
            {
                "room_number": row["room_number"],
                "name": row["name"] or "",
                "type": row["type"] or "",
            }
            for row in cur.fetchall()
        ])
    finally:
        conn.close()


@movie_router.route("/<movie_id>/screenings", methods=["GET"])
@require_user(admin_only=True)
def get_screenings(movie_id):
    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                st.id,
                st.show_date,
                st.show_time,
                st.cinema_room_number,
                cr.name AS room_name,
                cr.type AS room_type
            FROM showtimes st
            JOIN cinema_rooms cr
                ON cr.room_number = st.cinema_room_number
            WHERE st.movie_id = %s
            ORDER BY st.show_date, st.show_time
            """,
            (movie_id,),
        )

        return jsonify([
            {
                "id": str(row["id"]),
                "date": _serialize_date_or_time(row["show_date"]),
                "time": _serialize_date_or_time(row["show_time"]),
                "room": str(row["cinema_room_number"]),
                "room_name": row["room_name"] or "",
                "room_type": row["room_type"] or "",
            }
            for row in cur.fetchall()
        ])
    finally:
        conn.close()


@movie_router.route("/<movie_id>/screenings", methods=["POST"])
@require_user(admin_only=True)
def create_screening(movie_id):
    data = request.get_json() or {}

    show_date = str(data.get("show_date", "")).strip()
    show_time = str(data.get("show_time", "")).strip()
    room_number = data.get("cinema_room_number")

    if not show_date or not show_time or room_number is None:
        return jsonify({
            "error": "Vui lòng chọn ngày chiếu, giờ chiếu và phòng chiếu"
        }), 400

    try:
        room_number = int(room_number)
    except (TypeError, ValueError):
        return jsonify({"error": "Mã phòng chiếu không hợp lệ"}), 400

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            "SELECT id, release_date FROM movies WHERE id = %s",
            (movie_id,),
        )

        movie = cur.fetchone()
        if movie is None:
            return jsonify({"error": "Không tìm thấy phim"}), 404

        release_date = _serialize_date_or_time(movie["release_date"])
        if release_date and show_date < release_date[:10]:
            return jsonify({
                "error": "Ngày chiếu không được trước ngày khởi chiếu của phim"
            }), 400

        cur.execute(
            """
            SELECT room_number, name, type
            FROM cinema_rooms
            WHERE room_number = %s
            """,
            (room_number,),
        )

        room = cur.fetchone()

        if room is None:
            return jsonify({"error": "Không tìm thấy phòng chiếu"}), 404

        cur.execute(
            """
            SELECT id
            FROM showtimes
            WHERE movie_id = %s
              AND cinema_room_number = %s
              AND show_date = %s
              AND show_time = %s
            """,
            (movie_id, room_number, show_date, show_time),
        )

        if cur.fetchone() is not None:
            return jsonify({"error": "Lịch chiếu này đã tồn tại"}), 409

        cur.execute(
            """
            INSERT INTO showtimes (
                id, movie_id, cinema_room_number,
                show_date, show_time, format
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, show_date, show_time, cinema_room_number
            """,
            (
                str(uuid4()),
                movie_id,
                room_number,
                show_date,
                show_time,
                data.get("format", ""),
            ),
        )

        row = cur.fetchone()
        conn.commit()

        return jsonify({
            "id": str(row["id"]),
            "date": _serialize_date_or_time(row["show_date"]),
            "time": _serialize_date_or_time(row["show_time"]),
            "room": str(row["cinema_room_number"]),
            "room_name": room["name"] or "",
            "room_type": room["type"] or "",
        }), 201

    except Exception as error:
        conn.rollback()
        if getattr(error, "pgcode", None) == "23505":
            return jsonify({
                "error": "Phòng chiếu đã có lịch vào ngày và giờ này"
            }), 409
        raise
    finally:
        conn.close()


@movie_router.route(
    "/<movie_id>/screenings/<screening_id>",
    methods=["DELETE"],
)
@require_user(admin_only=True)
def delete_screening(movie_id, screening_id):
    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute(
            """
            DELETE FROM showtimes
            WHERE id = %s AND movie_id = %s
            RETURNING id
            """,
            (screening_id, movie_id),
        )

        row = cur.fetchone()

        if row is None:
            conn.rollback()
            return jsonify({"error": "Không tìm thấy lịch chiếu"}), 404

        conn.commit()

        return jsonify({
            "id": str(row["id"]),
            "message": "Đã xóa lịch chiếu",
        })

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
