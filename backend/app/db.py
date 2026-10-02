import os
import time
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

#Load private local settings before building the PostgreSQL connection address.
ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")

def get_database_url():
    """Retrieve PostgreSQL connection URI with fallbacks."""
    if "DATABASE_URL" in os.environ:
        return os.environ["DATABASE_URL"]

    host = os.environ.get("POSTGRES_HOST", "localhost")
    port = os.environ.get("POSTGRES_PORT", "5432")
    db = os.environ.get("POSTGRES_DB", "cinema_db")
    user = os.environ.get("POSTGRES_USER", "postgres")
    password = os.environ.get("POSTGRES_PASSWORD", "postgres")
    return f"postgresql://{user}:{password}@{host}:{port}/{db}"

def get_db_connection(max_retries=3, retry_delay=1):
    """
    Acquire a connection to PostgreSQL returning rows as dictionaries.
    Retries gracefully if the server is starting up.
    """
    #Every feature file calls this function instead of creating its own database connection.
    db_url = get_database_url()
    for attempt in range(1, max_retries + 1):
        try:
            #RealDictCursor lets code read columns by name, for example movie["title"].
            conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
            return conn
        except Exception as e:
            if attempt == max_retries:
                print(f"[DB] Connection failed after {max_retries} attempts: {e}")
                print("[DB] Troubleshooting guide:")
                print("  1. Verify PostgreSQL service is running (port 5432).")
                print("  2. Check DATABASE_URL or POSTGRES_PASSWORD in .env file.")
                print("  3. To reset password in psql: ALTER USER postgres PASSWORD 'postgres';")
                raise
            time.sleep(retry_delay)
