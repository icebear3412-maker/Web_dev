import sqlite3
from pathlib import Path


DATABASE = Path(__file__).resolve().parent.parent / "cinema.db"


# Create a connection to the database
def get_db():
    connection = sqlite3.connect(DATABASE)

    # Allow us to access database columns by name
    connection.row_factory = sqlite3.Row

    return connection


# Create the database tables if they don't already exist
def init_db():
    # Connect to the SQLite database
    connection = get_db()

    # Create the users table
    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    """)
    # Create the keys table for storing refresh tokens
    connection.execute("""
        CREATE TABLE IF NOT EXISTS keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            refresh_token TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    # Save the changes
    connection.commit()

    # Close the database connection
    connection.close()