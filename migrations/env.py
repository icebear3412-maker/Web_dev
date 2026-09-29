from __future__ import with_statement

import os
from pathlib import Path

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

#Alembic creates this object from migrations/alembic.ini when it starts.
#It holds the database settings and is also used by migration commands.
config = context.config

#Use the same private configuration as the Flask application.
ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")
database_url = os.environ.get("DATABASE_URL")
if database_url:
    #The application uses psycopg2-binary. Be explicit so SQLAlchemy does not select the separate psycopg package when a generic PostgreSQL URL is set.
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    # Override the URL in alembic.ini without storing credentials in the repo.
    config.set_main_option("sqlalchemy.url", database_url)

#This project writes migration operations by hand instead of generating from SQLAlchemy models, so there is no metadata for Alembic to inspect.
target_metadata = None


def run_migrations_offline() -> None:
    """Generate SQL migration statements without opening a database connection."""
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        #Put parameter values directly into generated SQL scripts.
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Connect to the configured database and apply migrations directly."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        #Migration commands are short-lived, so a connection pool is unnecessary.
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


#Alembic decides the mode from the command-line options used to invoke it.
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
