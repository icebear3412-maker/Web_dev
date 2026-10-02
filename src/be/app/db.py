import os
import time
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor


ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(ROOT_DIR / ".env")


def get_database_url():
    """Get PostgreSQL connection URL from environment variables."""
    if "DATABASE_URL" in os.environ:
        return os.environ["DATABASE_URL"]

    host = os.environ.get("POSTGRES_HOST", "localhost")
    port = os.environ.get("POSTGRES_PORT", "4444")
    db = os.environ.get("POSTGRES_DB", "cinema_db")
    user = os.environ.get("POSTGRES_USER", "postgres")
    password = os.environ.get("POSTGRES_PASSWORD", "postgres")

    return f"postgresql://{user}:{password}@{host}:{port}/{db}"


def get_db_connection(max_retries=3, retry_delay=1):
    """
    Connect to PostgreSQL and return rows as dictionaries.
    """
    database_url = get_database_url()

    for attempt in range(1, max_retries + 1):
        try:
            return psycopg2.connect(
                database_url,
                cursor_factory=RealDictCursor,
            )
        except Exception as error:
            if attempt == max_retries:
                print(
                    f"[DB] Connection failed after "
                    f"{max_retries} attempts: {error}"
                )
                raise

            time.sleep(retry_delay)
