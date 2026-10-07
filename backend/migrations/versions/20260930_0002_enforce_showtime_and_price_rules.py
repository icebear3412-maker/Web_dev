"""Enforce valid showtimes and non-negative movie prices.

Revision ID: 20260930_0002
Revises: 20260918_0001
Create Date: 2026-09-30
"""

from alembic import op


revision = "20260930_0002"
down_revision = "20260918_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    #Set any negative price to zero before blocking negative prices.
    op.execute("UPDATE movies SET base_price = 0 WHERE base_price < 0;")
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE movies ADD CONSTRAINT movies_base_price_nonnegative
                CHECK (base_price >= 0);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)

    #Store dates and times using database date/time types instead of text.
    #The migration stops if an old value is not a valid date or time.
    op.execute("ALTER TABLE showtimes ALTER COLUMN show_date TYPE DATE USING show_date::date;")
    op.execute("ALTER TABLE showtimes ALTER COLUMN show_time TYPE TIME USING show_time::time;")
    op.execute("ALTER TABLE showtimes ALTER COLUMN show_date SET NOT NULL;")
    op.execute("ALTER TABLE showtimes ALTER COLUMN show_time SET NOT NULL;")

    #Replace the automatically named rule with a stable constraint name.
    op.execute("""
        ALTER TABLE showtimes DROP CONSTRAINT IF EXISTS
            showtimes_cinema_room_id_show_date_show_time_key;
    """)
    op.execute("""
        DO $$ BEGIN
            IF EXISTS (
                SELECT 1 FROM showtimes
                GROUP BY cinema_room_id, show_date, show_time
                HAVING COUNT(*) > 1
            ) THEN
                RAISE EXCEPTION
                    'Duplicate room/date/time showtimes must be resolved before this migration can continue.';
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE showtimes ADD CONSTRAINT showtimes_room_start_key
                UNIQUE (cinema_room_id, show_date, show_time);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE showtimes DROP CONSTRAINT IF EXISTS showtimes_room_start_key;")
    op.execute("""
        ALTER TABLE showtimes ADD CONSTRAINT
            showtimes_cinema_room_id_show_date_show_time_key
            UNIQUE (cinema_room_id, show_date, show_time);
    """)
    op.execute("ALTER TABLE movies DROP CONSTRAINT IF EXISTS movies_base_price_nonnegative;")
