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
    #Let only one app process run this migration at a time.
    op.execute("SELECT pg_advisory_xact_lock(74839201);")

    #Store user accounts and contact details.
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
    
    #Store movie details used by showtimes and bookings.
    op.execute("""
        CREATE TABLE IF NOT EXISTS movies (
            id VARCHAR(255) PRIMARY KEY, title VARCHAR(255) NOT NULL, title_vn VARCHAR(255),
            genre TEXT, genre_en TEXT, duration VARCHAR(50), release_date VARCHAR(50),
            age_rating VARCHAR(50), rating REAL DEFAULT 0, votes INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'showing', featured BOOLEAN DEFAULT FALSE,
            director TEXT, "cast" TEXT, language VARCHAR(100), synopsis TEXT,
            synopsis_en TEXT, poster TEXT, backdrop TEXT, formats TEXT,
            base_price INTEGER DEFAULT 100000,
            CONSTRAINT movies_base_price_nonnegative CHECK (base_price >= 0),
            trailer_url TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #A cinema can contain several rooms.
    op.execute("""
        CREATE TABLE IF NOT EXISTS cinemas (
            id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL, address TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)
    #Store each screening room.
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
    #Add the cinema link when upgrading an older database.
    op.execute("ALTER TABLE cinema_rooms ADD COLUMN IF NOT EXISTS cinema_id VARCHAR(255);")

    #Store the images shown for each room.
    op.execute("""
        CREATE TABLE IF NOT EXISTS cinema_room_images (
            id VARCHAR(255) PRIMARY KEY,
            cinema_room_id VARCHAR(255) NOT NULL REFERENCES cinema_rooms(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Store the seats available in each room.
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

    #Store when and where each movie is shown.
    op.execute("""
        CREATE TABLE IF NOT EXISTS showtimes (
            id VARCHAR(255) PRIMARY KEY,
            movie_id VARCHAR(255) NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
            cinema_room_number INTEGER NOT NULL REFERENCES cinema_rooms(room_number) ON DELETE RESTRICT,
            show_date DATE NOT NULL, show_time TIME NOT NULL, format VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT showtimes_room_start_key
                UNIQUE (cinema_room_number, show_date, show_time)
        );
    """)

    #Link each booking to a user and a showtime.
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

    #Store the seats selected for each booking.
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

    #Add columns that may be missing from older databases.
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

    #Create three starter cinemas. Administrators can add more through the API.
    op.execute("""
        INSERT INTO cinemas (id, name, city, address)
        VALUES
            ('default-cinema-1', 'Cinema 1', 'City 1', 'Address 1'),
            ('default-cinema-2', 'Cinema 2', 'City 2', 'Address 2'),
            ('default-cinema-3', 'Cinema 3', 'City 3', 'Address 3')
        ON CONFLICT (id) DO NOTHING;
    """)

    op.execute("""
        DO $$ BEGIN
            ALTER TABLE cinema_rooms ADD CONSTRAINT cinema_rooms_cinema_id_fkey
            FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE RESTRICT;
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)
    #Give unnumbered rooms new numbers after the highest number already in use.
    op.execute("""
        WITH numbered AS (
            SELECT id,
                   COALESCE((SELECT MAX(room_number) FROM cinema_rooms), 0)
                       + ROW_NUMBER() OVER (ORDER BY id) AS number
            FROM cinema_rooms
            WHERE room_number IS NULL
        )
        UPDATE cinema_rooms
        SET room_number = numbered.number
        FROM numbered
        WHERE cinema_rooms.id = numbered.id;
    """)

    #Do not allow two rooms to have the same number.
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS cinema_rooms_room_number_key ON cinema_rooms(room_number);")

    #Every starter cinema has one 120-seat IMAX room and three 50-seat Standard rooms.
    op.execute("""
        INSERT INTO cinema_rooms (
            id, room_number, cinema_id, name, type, capacity, price_per_slot
        ) VALUES
            ('default-cinema-1-imax', 101, 'default-cinema-1', 'IMAX', 'IMAX', 120, 5000000),
            ('default-cinema-1-standard-1', 102, 'default-cinema-1', 'Room 2', 'Standard', 50, 5000000),
            ('default-cinema-1-standard-2', 103, 'default-cinema-1', 'Room 3', 'Standard', 50, 5000000),
            ('default-cinema-1-standard-3', 104, 'default-cinema-1', 'Room 4', 'Standard', 50, 5000000),
            ('default-cinema-2-imax', 201, 'default-cinema-2', 'IMAX', 'IMAX', 120, 5000000),
            ('default-cinema-2-standard-1', 202, 'default-cinema-2', 'Room 2', 'Standard', 50, 5000000),
            ('default-cinema-2-standard-2', 203, 'default-cinema-2', 'Room 3', 'Standard', 50, 5000000),
            ('default-cinema-2-standard-3', 204, 'default-cinema-2', 'Room 4', 'Standard', 50, 5000000),
            ('default-cinema-3-imax', 301, 'default-cinema-3', 'IMAX', 'IMAX', 120, 5000000),
            ('default-cinema-3-standard-1', 302, 'default-cinema-3', 'Room 2', 'Standard', 50, 5000000),
            ('default-cinema-3-standard-2', 303, 'default-cinema-3', 'Room 3', 'Standard', 50, 5000000),
            ('default-cinema-3-standard-3', 304, 'default-cinema-3', 'Room 4', 'Standard', 50, 5000000)
        ON CONFLICT (id) DO NOTHING;
    """)

    op.execute("""
        INSERT INTO seats (id, cinema_room_id, seat_code, row_label, seat_number)
        SELECT
            'seat-' || room.id || '-' || row_label || seat_number,
            room.id,
            row_label || seat_number,
            row_label,
            seat_number
        FROM (
            SELECT id, type FROM cinema_rooms
            WHERE cinema_id IN ('default-cinema-1', 'default-cinema-2', 'default-cinema-3')
        ) AS room
        CROSS JOIN unnest(ARRAY['A','B','C','D','E','F','G','H','I','J']) AS row_label
        CROSS JOIN generate_series(1, 12) AS seat_number
        WHERE room.type = 'IMAX'
           OR (room.type = 'Standard' AND row_label IN ('A','B','C','D','E') AND seat_number <= 10)
        ON CONFLICT DO NOTHING;
    """)

    #Copy old room links to the new room-number field.
    op.execute("""
        DO $$ BEGIN
            -- Run this step only when the old field exists.
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'showtimes' AND column_name = 'cinema_room_id'
            ) THEN
                -- Copy the room number into each matching showtime.
                UPDATE showtimes s SET cinema_room_number = r.room_number
                FROM cinema_rooms r
                WHERE s.cinema_room_id = r.id AND s.cinema_room_number IS NULL;
                -- New showtimes no longer need the old room ID field.
                ALTER TABLE showtimes ALTER COLUMN cinema_room_id DROP NOT NULL;
            END IF;
        END $$;
    """)

    #Require every showtime to use an existing room number.
    op.execute("""
        DO $$ BEGIN
            -- Reject room numbers that are not in cinema_rooms.
            ALTER TABLE showtimes ADD CONSTRAINT showtimes_cinema_room_number_fkey
            FOREIGN KEY (cinema_room_number) REFERENCES cinema_rooms(room_number) ON DELETE RESTRICT;
        -- Skip this step if the rule already exists.
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    """)

    #Update updated_at automatically whenever a record changes.
    op.execute("""
        CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
        BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
    """)
    for table in ("users", "movies", "cinemas", "cinema_rooms", "cinema_room_images", "seats", "showtimes", "bookings", "booking_seats"):
        #Apply the automatic updated_at behavior to each table.
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
