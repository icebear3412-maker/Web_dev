"""Connect backend_upload's original schema to the current booking API."""

from alembic import op
import sqlalchemy as sa

revision = "20261007_0004"
down_revision = "20261002_0003"
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    original_room_columns = {c["name"] for c in sa.inspect(connection).get_columns("cinema_rooms")}
    op.execute("""
        ALTER TABLE movies ADD COLUMN IF NOT EXISTS title_vn TEXT;
        ALTER TABLE movies ADD COLUMN IF NOT EXISTS genre_en TEXT;
        ALTER TABLE movies ADD COLUMN IF NOT EXISTS synopsis_en TEXT;
        ALTER TABLE cinema_rooms ADD COLUMN IF NOT EXISTS room_number INTEGER;
        ALTER TABLE cinema_rooms ADD COLUMN IF NOT EXISTS name TEXT;
        ALTER TABLE cinema_rooms ADD COLUMN IF NOT EXISTS capacity INTEGER;
        WITH numbered AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY cinema_id, id)
                       + COALESCE((SELECT MAX(room_number) FROM cinema_rooms), 0) AS n
            FROM cinema_rooms WHERE room_number IS NULL
        )
        UPDATE cinema_rooms r SET room_number = numbered.n
        FROM numbered WHERE numbered.id = r.id;
        ALTER TABLE cinema_rooms ALTER COLUMN room_number SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS cinema_rooms_room_number_key ON cinema_rooms(room_number);
        UPDATE cinema_rooms SET name = 'SV Cinema ' || type || ' Hall'
        WHERE name IS NULL OR name = '';
    """)
    if {"total_rows", "total_cols"}.issubset(original_room_columns):
        op.execute("UPDATE cinema_rooms SET capacity = total_rows * total_cols WHERE capacity IS NULL")
    else:
        op.execute("""
            UPDATE cinema_rooms r SET capacity = (SELECT COUNT(*) FROM seats s WHERE s.cinema_room_id = r.id)
            WHERE capacity IS NULL
        """)
    op.execute("""
        ALTER TABLE seats ADD COLUMN IF NOT EXISTS row_label VARCHAR(20);
        ALTER TABLE seats ADD COLUMN IF NOT EXISTS seat_number INTEGER;
        UPDATE seats SET row_label = substring(seat_code FROM '^[A-Za-z]+')
        WHERE row_label IS NULL;
        UPDATE seats SET seat_number = substring(seat_code FROM '[0-9]+$')::INTEGER
        WHERE seat_number IS NULL;
        ALTER TABLE showtimes ADD COLUMN IF NOT EXISTS cinema_room_number INTEGER;
        ALTER TABLE showtimes ADD COLUMN IF NOT EXISTS cinema_room_id VARCHAR(255);
        UPDATE showtimes s SET cinema_room_number = r.room_number
        FROM cinema_rooms r WHERE r.id = s.cinema_room_id AND s.cinema_room_number IS NULL;
        UPDATE showtimes s SET cinema_room_id = r.id
        FROM cinema_rooms r WHERE r.room_number = s.cinema_room_number;
        ALTER TABLE showtimes ALTER COLUMN cinema_room_number SET NOT NULL;
        DO $$ BEGIN
            ALTER TABLE showtimes ADD CONSTRAINT showtimes_room_number_fk
                FOREIGN KEY (cinema_room_number) REFERENCES cinema_rooms(room_number) ON DELETE RESTRICT;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        CREATE UNIQUE INDEX IF NOT EXISTS showtimes_room_number_start_key
            ON showtimes(cinema_room_number, show_date, show_time);
        CREATE OR REPLACE FUNCTION synchronize_showtime_room() RETURNS trigger AS $$
        BEGIN
            IF NEW.cinema_room_number IS NULL THEN
                SELECT room_number INTO NEW.cinema_room_number FROM cinema_rooms WHERE id = NEW.cinema_room_id;
            ELSE
                SELECT id INTO NEW.cinema_room_id FROM cinema_rooms WHERE room_number = NEW.cinema_room_number;
            END IF;
            IF NEW.cinema_room_id IS NULL OR NEW.cinema_room_number IS NULL THEN
                RAISE EXCEPTION 'Cinema room does not exist' USING ERRCODE = '23503';
            END IF;
            RETURN NEW;
        END; $$ LANGUAGE plpgsql;
        CREATE TRIGGER showtimes_sync_room BEFORE INSERT OR UPDATE ON showtimes
            FOR EACH ROW EXECUTE FUNCTION synchronize_showtime_room();
    """)


def downgrade():
    # Retain metadata that may have existed before this migration.
    op.execute("""
        DROP TRIGGER IF EXISTS showtimes_sync_room ON showtimes;
        DROP FUNCTION IF EXISTS synchronize_showtime_room();
        DROP INDEX IF EXISTS showtimes_room_number_start_key;
        ALTER TABLE showtimes DROP CONSTRAINT IF EXISTS showtimes_room_number_fk;
    """)
