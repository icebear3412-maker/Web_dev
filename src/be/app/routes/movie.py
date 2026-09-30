import sys
import uuid
from pathlib import Path

from flask import Blueprint, jsonify, request


PROJECT_ROOT = Path(__file__).resolve().parents[4]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from backend.app.db import get_db_connection


movie_router = Blueprint("movies", __name__)


# ============================================================
# GET ALL MOVIES
# ============================================================

@movie_router.route("", methods=["GET"])
def get_movies():
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    title,
                    genre,
                    duration,
                    release_date,
                    status,
                    poster
                FROM movies
                ORDER BY created_at DESC
                """
            )

            movies = cursor.fetchall()

        return jsonify(movies)

    finally:
        conn.close()


# ============================================================
# CREATE MOVIE
# ============================================================

@movie_router.route("", methods=["POST"])
def create_movie():
    data = request.get_json() or {}

    movie_id = data.get("id")
    title = data.get("title")

    if not movie_id or not title:
        return jsonify(
            {
                "error": "id and title are required"
            }
        ), 400

    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO movies (
                    id,
                    title,
                    genre,
                    duration,
                    release_date,
                    poster,
                    status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING
                    id,
                    title,
                    genre,
                    duration,
                    release_date,
                    status,
                    poster
                """,
                (
                    movie_id,
                    title,
                    data.get("genre", ""),
                    data.get("duration", ""),
                    data.get("release_date", ""),
                    data.get("poster", ""),
                    data.get("status", "showing"),
                ),
            )

            movie = cursor.fetchone()

        conn.commit()

        return jsonify(movie), 201

    except Exception as error:
        conn.rollback()

        return jsonify(
            {
                "error": str(error)
            }
        ), 500

    finally:
        conn.close()


# ============================================================
# UPDATE MOVIE
# ============================================================

@movie_router.route("/<movie_id>", methods=["PATCH"])
def update_movie(movie_id):
    data = request.get_json() or {}

    allowed_fields = {
        "title",
        "genre",
        "duration",
        "release_date",
        "poster",
        "status",
    }

    updates = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    if not updates:
        return jsonify(
            {
                "error": "No valid fields to update"
            }
        ), 400

    conn = get_db_connection()

    try:
        set_parts = []
        values = []

        for field, value in updates.items():
            set_parts.append(f"{field} = %s")
            values.append(value)

        values.append(movie_id)

        query = f"""
            UPDATE movies
            SET {", ".join(set_parts)},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING
                id,
                title,
                genre,
                duration,
                release_date,
                status,
                poster
        """

        with conn.cursor() as cursor:
            cursor.execute(query, values)

            movie = cursor.fetchone()

        if movie is None:
            conn.rollback()

            return jsonify(
                {
                    "error": "Movie not found"
                }
            ), 404

        conn.commit()

        return jsonify(movie)

    except Exception as error:
        conn.rollback()

        return jsonify(
            {
                "error": str(error)
            }
        ), 500

    finally:
        conn.close()


# ============================================================
# GET CINEMA ROOMS
# ============================================================

@movie_router.route("/rooms", methods=["GET"])
def get_cinema_rooms():
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    room_number,
                    name,
                    type,
                    capacity
                FROM cinema_rooms
                ORDER BY room_number
                """
            )

            rooms = cursor.fetchall()

        return jsonify(rooms)

    finally:
        conn.close()


# ============================================================
# GET MOVIE SHOWTIMES
# ============================================================

@movie_router.route("/<movie_id>/showtimes", methods=["GET"])
def get_showtimes(movie_id):
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    movie_id,
                    cinema_room_number,
                    show_date,
                    show_time,
                    format
                FROM showtimes
                WHERE movie_id = %s
                ORDER BY show_date, show_time
                """,
                (movie_id,),
            )

            showtimes = cursor.fetchall()

        return jsonify(showtimes)

    finally:
        conn.close()


# ============================================================
# CREATE MOVIE SHOWTIME
# ============================================================

@movie_router.route("/<movie_id>/showtimes", methods=["POST"])
def create_showtime(movie_id):
    data = request.get_json() or {}

    cinema_room_number = data.get("cinema_room_number")
    show_date = data.get("show_date")
    show_time = data.get("show_time")
    show_format = data.get("format", "")

    if not cinema_room_number or not show_date or not show_time:
        return jsonify(
            {
                "error": (
                    "cinema_room_number, show_date "
                    "and show_time are required"
                )
            }
        ), 400

    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            # Check movie
            cursor.execute(
                """
                SELECT id
                FROM movies
                WHERE id = %s
                """,
                (movie_id,),
            )

            movie = cursor.fetchone()

            if movie is None:
                conn.rollback()

                return jsonify(
                    {
                        "error": "Movie not found"
                    }
                ), 404

            # Check cinema room
            cursor.execute(
                """
                SELECT room_number
                FROM cinema_rooms
                WHERE room_number = %s
                """,
                (cinema_room_number,),
            )

            room = cursor.fetchone()

            if room is None:
                conn.rollback()

                return jsonify(
                    {
                        "error": "Cinema room not found"
                    }
                ), 404

            showtime_id = (
                f"showtime-{uuid.uuid4().hex[:12]}"
            )

            cursor.execute(
                """
                INSERT INTO showtimes (
                    id,
                    movie_id,
                    cinema_room_number,
                    show_date,
                    show_time,
                    format
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING
                    id,
                    movie_id,
                    cinema_room_number,
                    show_date,
                    show_time,
                    format
                """,
                (
                    showtime_id,
                    movie_id,
                    cinema_room_number,
                    show_date,
                    show_time,
                    show_format,
                ),
            )

            showtime = cursor.fetchone()

        conn.commit()

        return jsonify(showtime), 201

    except Exception as error:
        conn.rollback()

        return jsonify(
            {
                "error": str(error)
            }
        ), 500

    finally:
        conn.close()


# ============================================================
# DELETE MOVIE SHOWTIME
# ============================================================

@movie_router.route(
    "/<movie_id>/showtimes/<showtime_id>",
    methods=["DELETE"],
)
def delete_showtime(movie_id, showtime_id):
    conn = get_db_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM showtimes
                WHERE id = %s
                  AND movie_id = %s
                RETURNING id
                """,
                (
                    showtime_id,
                    movie_id,
                ),
            )

            deleted = cursor.fetchone()

        if deleted is None:
            conn.rollback()

            return jsonify(
                {
                    "error": "Showtime not found"
                }
            ), 404

        conn.commit()

        return jsonify(
            {
                "message": "Showtime deleted"
            }
        )

    except Exception as error:
        conn.rollback()

        return jsonify(
            {
                "error": str(error)
            }
        ), 500

    finally:
        conn.close()