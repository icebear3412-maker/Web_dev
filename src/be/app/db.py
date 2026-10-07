"""Share the database configuration imported from backend_upload."""

from backend.app.db import get_database_url, get_db_connection

__all__ = ["get_database_url", "get_db_connection"]
