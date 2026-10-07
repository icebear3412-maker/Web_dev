"""Upgrade a fresh database or the existing backend_upload schema atomically."""

from pathlib import Path
import sys

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from backend.app.db import get_database_url


def upgrade_database():
    config = Config(str(ROOT / "backend" / "alembic.ini"))
    url = get_database_url().replace("postgresql://", "postgresql+psycopg2://", 1)
    engine = create_engine(url)
    try:
        with engine.begin() as connection:
            connection.execute(text("SELECT pg_advisory_xact_lock(74839201)"))
            inspector = inspect(connection)
            tables = inspector.get_table_names()
            revision = None
            if "alembic_version" in tables:
                revision = connection.execute(text("SELECT version_num FROM alembic_version")).scalar()
            # Some local databases use room numbers but still report 0001.
            # Supply its legacy ID for 0002 without deleting existing records.
            if revision == "20260918_0001" and "showtimes" in tables:
                columns = {column["name"] for column in inspector.get_columns("showtimes")}
                if "cinema_room_number" in columns and "cinema_room_id" not in columns:
                    connection.execute(text("ALTER TABLE showtimes ADD COLUMN cinema_room_id VARCHAR(255)"))
                    connection.execute(text("""
                        UPDATE showtimes s SET cinema_room_id = r.id
                        FROM cinema_rooms r WHERE r.room_number = s.cinema_room_number
                    """))
                    if connection.execute(text("SELECT count(*) FROM showtimes WHERE cinema_room_id IS NULL")).scalar():
                        raise RuntimeError("A showtime references a missing room; database changes will be rolled back.")
            config.attributes["connection"] = connection
            command.upgrade(config, "head")
        print("Database upgrade completed successfully.")
    finally:
        engine.dispose()


if __name__ == "__main__":
    upgrade_database()
