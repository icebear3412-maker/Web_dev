"""Create the initial SV Cinema schema.

Revision ID: 20260918_0001
Revises: 
Create Date: 2026-09-18
"""

from alembic import op

revision = "20260918_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    #Stop multiple app workers from trying to change the schema at the same time.
    op.execute("SELECT pg_advisory_xact_lock(74839201);")

    #User accounts are the source of customer names, emails, and phone numbers.
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL, username VARCHAR(255), phone VARCHAR(50),
            password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'user',
            status VARCHAR(50) DEFAULT 'active', tier VARCHAR(50) DEFAULT 'MEMBER',
            points INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    #Movie information is stored once and reused by every showtime.
    op.execute("""
        CREATE TABLE IF NOT EXISTS movies (
            id VARCHAR(255) PRIMARY KEY, title VARCHAR(255) NOT NULL, title_vn VARCHAR(255),
            genre TEXT, genre_en TEXT, duration VARCHAR(50), release_date VARCHAR(50),
            age_rating VARCHAR(50), rating REAL DEFAULT 0, votes INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'showing', featured BOOLEAN DEFAULT FALSE,
            director TEXT, "cast" TEXT, language VARCHAR(100), synopsis TEXT,
            synopsis_en TEXT, poster TEXT, backdrop TEXT, formats TEXT,
            base_price INTEGER DEFAULT 100000, trailer_url TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #A cinema is a real-world venue; one cinema may contain many cinema rooms.
    op.execute("""
        CREATE TABLE IF NOT EXISTS cinemas (
            id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL, address TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    #Save the new core table before older-database upgrade steps run later in this migration.

    #A cinema room is the physical hall; its images and seats live in separate tables.
    op.execute("""
        CREATE TABLE IF NOT EXISTS cinema_rooms (
            id VARCHAR(255) PRIMARY KEY, room_number INTEGER UNIQUE NOT NULL,
            cinema_id VARCHAR(255) NOT NULL REFERENCES cinemas(id) ON DELETE RESTRICT,
            name VARCHAR(255) NOT NULL, type VARCHAR(100), capacity INTEGER DEFAULT 100,
            price_per_slot INTEGER DEFAULT 5000000, features TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    #Older databases already have cinema_rooms, so add this new link immediately.
    op.execute("ALTER TABLE cinema_rooms ADD COLUMN IF NOT EXISTS cinema_id VARCHAR(255);")

    #One room can have many gallery images.
    op.execute("""
        CREATE TABLE IF NOT EXISTS cinema_room_images (
            id VARCHAR(255) PRIMARY KEY,
            cinema_room_id VARCHAR(255) NOT NULL REFERENCES cinema_rooms(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Seats belong to a room, not directly to a booking.
    op.execute("""
        CREATE TABLE IF NOT EXISTS seats (
            id VARCHAR(255) PRIMARY KEY,
            cinema_room_id VARCHAR(255) NOT NULL REFERENCES cinema_rooms(id) ON DELETE CASCADE,
            seat_code VARCHAR(20) NOT NULL, row_label VARCHAR(10), seat_number INTEGER,
            seat_type VARCHAR(50) DEFAULT 'standard',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (cinema_room_id, seat_code)
        );
    """)

    #A showtime tells the system which movie plays in which room, and when.
    op.execute("""
        CREATE TABLE IF NOT EXISTS showtimes (
            id VARCHAR(255) PRIMARY KEY,
            movie_id VARCHAR(255) NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
            cinema_room_number INTEGER NOT NULL REFERENCES cinema_rooms(room_number) ON DELETE RESTRICT,
            show_date VARCHAR(50) NOT NULL, show_time VARCHAR(50) NOT NULL, format VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (movie_id, cinema_room_number, show_date, show_time)
        );
    """)

    #A booking connects one signed-in user to one showtime.
    op.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            booking_ref VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
            showtime_id VARCHAR(255) NOT NULL REFERENCES showtimes(id) ON DELETE RESTRICT,
            status VARCHAR(50) DEFAULT 'pending_counter_payment', total_amount INTEGER DEFAULT 0,
            data_json TEXT NOT NULL DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #This table records the individual seats selected for a booking.
    op.execute("""
        CREATE TABLE IF NOT EXISTS booking_seats (
            id VARCHAR(255) PRIMARY KEY,
            booking_ref VARCHAR(255) NOT NULL REFERENCES bookings(booking_ref) ON DELETE CASCADE,
            showtime_id VARCHAR(255) NOT NULL REFERENCES showtimes(id) ON DELETE RESTRICT,
            seat_id VARCHAR(255) NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (showtime_id, seat_id)
        );
    """)

    #CREATE TABLE does not add fields to old tables, so upgrade them one column at a time.
    additions = {
        "users": [("updated_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")],
        "movies": [("created_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"), ("updated_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")],
        "cinema_rooms": [("room_number", "INTEGER"), ("cinema_id", "VARCHAR(255)"), ("created_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"), ("updated_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")],
        "showtimes": [("cinema_room_number", "INTEGER"), ("created_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"), ("updated_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")],
        "bookings": [("updated_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")],
    }
    for table, columns in additions.items():
        for name, definition in columns:
            op.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {name} {definition};")

    #Create the first cinema location; existing records are not overwritten.
    op.execute("""
        INSERT INTO cinemas (id, name, city, address)
        VALUES ('cinema-hcm-1', 'SV Cinema Vincom Đồng Khởi', 'Ho Chi Minh City', '72 Lê Thánh Tôn, District 1')
        ON CONFLICT (id) DO NOTHING;
    """)
    #Older rooms belonged to the only cinema implicitly, so connect them to the default cinema.
    op.execute("UPDATE cinema_rooms SET cinema_id = 'cinema-hcm-1' WHERE cinema_id IS NULL;")
    op.execute("""
        DO $$ BEGIN
            ALTER TABLE cinema_rooms ADD CONSTRAINT cinema_rooms_cinema_id_fkey
            FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE RESTRICT;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)
    #Create a default room for a new installation; leave it unchanged if it already exists.
    op.execute("""
        -- COALESCE preserves an existing room number instead of overwriting it with 1.
        INSERT INTO cinema_rooms (id, room_number, cinema_id, name, type, capacity, price_per_slot)
        VALUES ('room-imax', 1, 'cinema-hcm-1', 'SV Cinema IMAX Hall', 'IMAX', 380, 15000000)
        ON CONFLICT (id) DO UPDATE SET
            room_number = COALESCE(cinema_rooms.room_number, EXCLUDED.room_number),
            cinema_id = COALESCE(cinema_rooms.cinema_id, EXCLUDED.cinema_id);
    """)

    #Older rooms did not have numbers, so give each existing room a unique number.
    op.execute("""
        -- ROW_NUMBER creates 1, 2, 3... only for rooms that are currently missing a number.
        UPDATE cinema_rooms SET room_number = numbered.number
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS number
            FROM cinema_rooms WHERE room_number IS NULL
        ) AS numbered
        WHERE cinema_rooms.id = numbered.id;
    """)

    #A room number must be unique before showtimes can safely refer to it.
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS cinema_rooms_room_number_key ON cinema_rooms(room_number);")

    #Convert the old room-id relationship into the new room-number relationship when possible.
    op.execute("""
        DO $$ BEGIN
            -- This check means new databases skip the old cinema_room_id conversion.
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'showtimes' AND column_name = 'cinema_room_id'
            ) THEN
                -- Find each old room's number and copy it into its linked showtime.
                UPDATE showtimes s SET cinema_room_number = r.room_number
                FROM cinema_rooms r
                WHERE s.cinema_room_id = r.id AND s.cinema_room_number IS NULL;
                -- The old column becomes optional so new showtimes only need room_number.
                ALTER TABLE showtimes ALTER COLUMN cinema_room_id DROP NOT NULL;
            END IF;
        END $$;
    """)

    #Enforce that every showtime uses a real cinema-room number.
    op.execute("""
        DO $$ BEGIN
            -- A foreign key blocks saving a showtime for a room number that does not exist.
            ALTER TABLE showtimes ADD CONSTRAINT showtimes_cinema_room_number_fkey
            FOREIGN KEY (cinema_room_number) REFERENCES cinema_rooms(room_number) ON DELETE RESTRICT;
        -- Ignore the error when the constraint was already created by an earlier startup.
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)

    #Automatically update modified time whenever a record changes.
    #One shared PostgreSQL function updates modified time for every changed record.
    op.execute("""
        CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
        BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
    """)
    for table in ("users", "movies", "cinemas", "cinema_rooms", "cinema_room_images", "seats", "showtimes", "bookings", "booking_seats"):
        #Recreate the trigger safely so every listed table receives the same behavior.
        op.execute(f"DROP TRIGGER IF EXISTS {table}_updated_at ON {table};")
        op.execute(f"CREATE TRIGGER {table}_updated_at BEFORE UPDATE ON {table} FOR EACH ROW EXECUTE FUNCTION set_updated_at();")

    print("[Migrations] PostgreSQL tables verified and up to date.")


def downgrade() -> None:
    """Reverse the initial schema. This deletes all application data."""
    op.execute("DROP TABLE IF EXISTS booking_seats CASCADE;")
    op.execute("DROP TABLE IF EXISTS bookings CASCADE;")
    op.execute("DROP TABLE IF EXISTS showtimes CASCADE;")
    op.execute("DROP TABLE IF EXISTS seats CASCADE;")
    op.execute("DROP TABLE IF EXISTS cinema_room_images CASCADE;")
    op.execute("DROP TABLE IF EXISTS cinema_rooms CASCADE;")
    op.execute("DROP TABLE IF EXISTS cinemas CASCADE;")
    op.execute("DROP TABLE IF EXISTS movies CASCADE;")
    op.execute("DROP TABLE IF EXISTS users CASCADE;")
    op.execute("DROP FUNCTION IF EXISTS set_updated_at() CASCADE;")
