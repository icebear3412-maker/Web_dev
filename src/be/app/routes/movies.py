from flask import Blueprint, jsonify, request

from backend.app.db import get_db_connection
from app.security import require_user

movies_router = Blueprint("movies", __name__)

MOVIE_FIELDS = {
    "title", "title_vn", "genre", "genre_en", "duration", "release_date",
    "age_rating", "rating", "votes", "status", "featured", "director",
    "cast", "language", "synopsis", "synopsis_en", "poster", "backdrop",
    "formats", "base_price", "trailer_url",
}


@movies_router.get("")
def list_movies():
    status = request.args.get("status")
    search = request.args.get("q", "").strip()
    clauses, params = [], []
    if status:
        clauses.append("status = %s")
        params.append(status)
    if search:
        clauses.append("(title ILIKE %s OR title_vn ILIKE %s)")
        params.extend([f"%{search}%", f"%{search}%"])
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT * FROM movies {where} ORDER BY featured DESC, created_at DESC",
                tuple(params),
            )
            movies = cur.fetchall()
        return jsonify({"movies": movies})
    finally:
        conn.close()


@movies_router.get("/<movie_id>")
def get_movie(movie_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM movies WHERE id = %s", (movie_id,))
            movie = cur.fetchone()
        if not movie:
            return jsonify({"error": "Movie not found"}), 404
        return jsonify({"movie": movie})
    finally:
        conn.close()


@movies_router.post("")
@require_user(admin_only=True)
def create_movie():
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"error": "A JSON object is required"}), 400
    movie_id, title = payload.get("id"), payload.get("title")
    if not isinstance(movie_id, str) or not movie_id.strip() or not isinstance(title, str) or not title.strip():
        return jsonify({"error": "id and title are required"}), 400
    values = {key: value for key, value in payload.items() if key in MOVIE_FIELDS}
    if any(not is_json_value(key, value) for key, value in values.items()):
        return jsonify({"error": "Invalid movie field value"}), 400
    columns = [f'"{column}"' for column in ["id", *values.keys()]]
    params = [movie_id.strip(), *values.values()]
    placeholders = ", ".join(["%s"] * len(columns))
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO movies ({', '.join(columns)}) VALUES ({placeholders}) RETURNING *",
                tuple(params),
            )
            movie = cur.fetchone()
        conn.commit()
        return jsonify({"movie": movie}), 201
    except Exception as error:
        conn.rollback()
        if getattr(error, "pgcode", None) == "23505":
            return jsonify({"error": "A movie with this id already exists"}), 409
        raise
    finally:
        conn.close()


@movies_router.patch("/<movie_id>")
@require_user(admin_only=True)
def update_movie(movie_id):
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"error": "A JSON object is required"}), 400
    values = {key: value for key, value in payload.items() if key in MOVIE_FIELDS}
    if not values:
        return jsonify({"error": "At least one supported movie field is required"}), 400
    if any(not is_json_value(key, value) for key, value in values.items()):
        return jsonify({"error": "Invalid movie field value"}), 400
    assignments = ", ".join(f'"{key}" = %s' for key in values)
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE movies SET {assignments} WHERE id = %s RETURNING *",
                (*values.values(), movie_id),
            )
            movie = cur.fetchone()
        if not movie:
            conn.rollback()
            return jsonify({"error": "Movie not found"}), 404
        conn.commit()
        return jsonify({"movie": movie})
    finally:
        conn.close()


def is_json_value(field, value):
    if field in {"rating"}:
        return value is None or isinstance(value, (int, float))
    if field in {"votes", "base_price"}:
        return value is None or isinstance(value, int)
    if field == "featured":
        return value is None or isinstance(value, bool)
    return value is None or isinstance(value, str)
