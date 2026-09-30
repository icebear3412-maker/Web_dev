import os

import psycopg2
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is not set")

    return psycopg2.connect(database_url)


def init_db():
    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Movies table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS movies (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                genre VARCHAR(100),
                duration INTEGER,
                release_date DATE,
                poster TEXT,
                status VARCHAR(20) NOT NULL DEFAULT 'showing'
            )
            """
        )

        # Screenings table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS screenings (
                id SERIAL PRIMARY KEY,
                movie_id INTEGER NOT NULL
                    REFERENCES movies(id)
                    ON DELETE CASCADE,
                screening_time TIME NOT NULL,
                room VARCHAR(100) NOT NULL
            )
            """
        )

        connection.commit()
        cursor.close()

    finally:
        connection.close()