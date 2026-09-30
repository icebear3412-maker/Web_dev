from flask import Blueprint, jsonify, request

from app.db import get_connection

movie_router = Blueprint("movie", __name__)


# ============================================================
# GET ALL MOVIES
# ============================================================

@movie_router.route("", methods=["GET"])
def get_movies():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                title,
                genre,
                duration,
                release_date,
                poster,
                status
            FROM movies
            ORDER BY id
            """
        )

        rows = cursor.fetchall()

        movies = []

        for row in rows:
            movies.append(
                {
                    "id": row[0],
                    "title": row[1],
                    "genre": row[2],
                    "duration": row[3],
                    "release_date": (
                        row[4].isoformat()
                        if row[4]
                        else None
                    ),
                    "poster": row[5],
                    "status": row[6],
                }
            )

        cursor.close()

        return jsonify(movies)

    finally:
        connection.close()


# ============================================================
# CREATE MOVIE
# ============================================================

@movie_router.route("", methods=["POST"])
def create_movie():
    data = request.get_json() or {}

    title = data.get("title")
    genre = data.get("genre")
    duration = data.get("duration")
    release_date = data.get("release_date")
    poster = data.get("poster")
    status = data.get("status", "showing")

    if not title:
        return jsonify(
            {
                "error": "Title is required"
            }
        ), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO movies
                (
                    title,
                    genre,
                    duration,
                    release_date,
                    poster,
                    status
                )
            VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            RETURNING
                id,
                title,
                genre,
                duration,
                release_date,
                poster,
                status
            """,
            (
                title,
                genre,
                duration,
                release_date,
                poster,
                status,
            ),
        )

        row = cursor.fetchone()

        connection.commit()
        cursor.close()

        return jsonify(
            {
                "id": row[0],
                "title": row[1],
                "genre": row[2],
                "duration": row[3],
                "release_date": (
                    row[4].isoformat()
                    if row[4]
                    else None
                ),
                "poster": row[5],
                "status": row[6],
            }
        ), 201

    finally:
        connection.close()


# ============================================================
# UPDATE MOVIE
# ============================================================

@movie_router.route("/<int:movie_id>", methods=["PATCH"])
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

    fields = []
    values = []

    for field in allowed_fields:
        if field in data:
            fields.append(f"{field} = %s")
            values.append(data[field])

    if not fields:
        return jsonify(
            {
                "error": "No fields to update"
            }
        ), 400

    values.append(movie_id)

    connection = get_connection()

    try:
        cursor = connection.cursor()

        query = f"""
            UPDATE movies
            SET {", ".join(fields)}
            WHERE id = %s
            RETURNING
                id,
                title,
                genre,
                duration,
                release_date,
                poster,
                status
        """

        cursor.execute(query, values)

        row = cursor.fetchone()

        if row is None:
            connection.rollback()
            cursor.close()

            return jsonify(
                {
                    "error": "Movie not found"
                }
            ), 404

        connection.commit()
        cursor.close()

        return jsonify(
            {
                "id": row[0],
                "title": row[1],
                "genre": row[2],
                "duration": row[3],
                "release_date": (
                    row[4].isoformat()
                    if row[4]
                    else None
                ),
                "poster": row[5],
                "status": row[6],
            }
        )

    finally:
        connection.close()


# ============================================================
# DELETE MOVIE
# ============================================================

@movie_router.route("/<int:movie_id>", methods=["DELETE"])
def delete_movie(movie_id):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM movies
            WHERE id = %s
            RETURNING id
            """,
            (movie_id,),
        )

        result = cursor.fetchone()

        if result is None:
            connection.rollback()
            cursor.close()

            return jsonify(
                {
                    "error": "Movie not found"
                }
            ), 404

        connection.commit()
        cursor.close()

        return jsonify(
            {
                "id": movie_id,
                "message": "Movie deleted successfully",
            }
        )

    finally:
        connection.close()


# ============================================================
# GET SCREENINGS FOR A MOVIE
# ============================================================

@movie_router.route(
    "/<int:movie_id>/screenings",
    methods=["GET"],
)
def get_screenings(movie_id):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Check movie exists
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
            cursor.close()

            return jsonify(
                {
                    "error": "Movie not found"
                }
            ), 404

        cursor.execute(
            """
            SELECT
                id,
                screening_time,
                room
            FROM screenings
            WHERE movie_id = %s
            ORDER BY screening_time
            """,
            (movie_id,),
        )

        rows = cursor.fetchall()

        screenings = []

        for row in rows:
            screenings.append(
                {
                    "id": row[0],
                    "time": row[1].strftime("%H:%M"),
                    "room": row[2],
                }
            )

        cursor.close()

        return jsonify(screenings)

    finally:
        connection.close()


# ============================================================
# CREATE SCREENING
# ============================================================

@movie_router.route(
    "/<int:movie_id>/screenings",
    methods=["POST"],
)
def create_screening(movie_id):
    data = request.get_json() or {}

    screening_time = data.get("time")
    room = data.get("room")

    if not screening_time:
        return jsonify(
            {
                "error": "Time is required"
            }
        ), 400

    if not room:
        return jsonify(
            {
                "error": "Room is required"
            }
        ), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Check movie exists
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
            cursor.close()

            return jsonify(
                {
                    "error": "Movie not found"
                }
            ), 404

        cursor.execute(
            """
            INSERT INTO screenings
                (
                    movie_id,
                    screening_time,
                    room
                )
            VALUES
                (
                    %s,
                    %s,
                    %s
                )
            RETURNING
                id,
                screening_time,
                room
            """,
            (
                movie_id,
                screening_time,
                room,
            ),
        )

        row = cursor.fetchone()

        connection.commit()
        cursor.close()

        return jsonify(
            {
                "id": row[0],
                "time": row[1].strftime("%H:%M"),
                "room": row[2],
            }
        ), 201

    finally:
        connection.close()


# ============================================================
# DELETE SCREENING
# ============================================================

@movie_router.route(
    "/<int:movie_id>/screenings/<int:screening_id>",
    methods=["DELETE"],
)
def delete_screening(movie_id, screening_id):
    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM screenings
            WHERE id = %s
              AND movie_id = %s
            RETURNING id
            """,
            (
                screening_id,
                movie_id,
            ),
        )

        result = cursor.fetchone()

        if result is None:
            connection.rollback()
            cursor.close()

            return jsonify(
                {
                    "error": "Screening not found"
                }
            ), 404

        connection.commit()
        cursor.close()

        return jsonify(
            {
                "id": screening_id,
                "message": "Screening deleted successfully",
            }
        )

    finally:
        connection.close()