import sys
import os
import uuid
from pathlib import Path

import bcrypt
from flask import Flask
from flask_cors import CORS

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.routes.auth import auth_router
from app.routes.bookings import bookings_router
from app.routes.movies import movies_router
from backend.app.db import get_db_connection


def bootstrap_admin():
    """Create the first admin account once, when explicit credentials are set."""
    email = os.environ.get("BOOTSTRAP_ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("BOOTSTRAP_ADMIN_PASSWORD", "")
    if not email and not password:
        return
    if not email or not password:
        raise RuntimeError("Set both BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD.")

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Serialize concurrent app workers so only one can create the account.
            cur.execute("SELECT pg_advisory_xact_lock(%s)", (74839202,))
            cur.execute("SELECT id, role FROM users WHERE email = %s", (email,))
            existing = cur.fetchone()
            if existing:
                if existing["role"] != "admin":
                    raise RuntimeError(
                        "Bootstrap email already belongs to a non-admin account; refusing to promote it."
                    )
                print("[BOOTSTRAP] Admin account already exists; no changes made.")
                conn.commit()
                return

            admin_id = f"admin-{uuid.uuid4()}"
            cur.execute(
                """INSERT INTO users (id, name, email, username, password, role, status)
                   VALUES (%s, %s, %s, %s, %s, 'admin', 'active')""",
                (admin_id, "Cinema Admin", email, email.split("@", 1)[0], password_hash),
            )
        conn.commit()
        print("[BOOTSTRAP] First admin account created.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


bootstrap_admin()

server = Flask(__name__)
CORS(server)

server.register_blueprint(auth_router, url_prefix="/auth")
server.register_blueprint(movies_router, url_prefix="/movies")
server.register_blueprint(bookings_router, url_prefix="/bookings")

if __name__ == "__main__":
    server.run(host="localhost", port=5000, debug=True)
