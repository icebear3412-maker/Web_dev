from app.db import get_db_connection

def run_migrations():
    conn = None
    try:
        conn = get_db_connection(max_retries=3, retry_delay=1)
        with conn.cursor() as cur:
            #Stop multiple app workers from trying to change the schema at the same time.
            cur.execute("SELECT pg_advisory_xact_lock(74839201);")

            #User accounts are the source of customer names, emails, and phone numbers.
            cur.execute("""
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
            cur.execute("""
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

            #A cinema room is the physical hall; its images and seats live in separate tables.
            cur.execute("""
                CREATE TABLE IF NOT EXISTS cinema_rooms (
                    id VARCHAR(255) PRIMARY KEY, room_number INTEGER UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL, type VARCHAR(100), capacity INTEGER DEFAULT 100,
                    price_per_slot INTEGER DEFAULT 5000000, features TEXT,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
            """)

            #One room can have many gallery images.
            cur.execute("""
                CREATE TABLE IF NOT EXISTS cinema_room_images (
                    id VARCHAR(255) PRIMARY KEY,
                    cinema_room_id VARCHAR(255) NOT NULL REFERENCES cinema_rooms(id) ON DELETE CASCADE,
                    image_url TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
            """)

            #Seats belong to a room, not directly to a booking.
            cur.execute("""
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
            cur.execute("""
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
            cur.execute("""
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
            cur.execute("""
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
                "cinema_rooms": [("room_number", "INTEGER"), ("created_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"), ("updated_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")],
                "showtimes": [("cinema_room_number", "INTEGER"), ("created_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"), ("updated_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")],
                "bookings": [("updated_at", "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP")],
            }
            for table, columns in additions.items():
                for name, definition in columns:
                    cur.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {name} {definition};")

            #Create a default room for a new installation; leave it unchanged if it already exists.
            cur.execute("""
                -- COALESCE preserves an existing room number instead of overwriting it with 1.
                INSERT INTO cinema_rooms (id, room_number, name, type, capacity, price_per_slot)
                VALUES ('room-imax', 1, 'SV Cinema IMAX Hall', 'IMAX', 380, 15000000)
                ON CONFLICT (id) DO UPDATE SET room_number = COALESCE(cinema_rooms.room_number, EXCLUDED.room_number);
            """)

            #Older rooms did not have numbers, so give each existing room a unique number.
            cur.execute("""
                -- ROW_NUMBER creates 1, 2, 3... only for rooms that are currently missing a number.
                UPDATE cinema_rooms SET room_number = numbered.number
                FROM (
                    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS number
                    FROM cinema_rooms WHERE room_number IS NULL
                ) AS numbered
                WHERE cinema_rooms.id = numbered.id;
            """)

            #A room number must be unique before showtimes can safely refer to it.
            cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS cinema_rooms_room_number_key ON cinema_rooms(room_number);")

            #Convert the old room-id relationship into the new room-number relationship when possible.
            cur.execute("""
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
            cur.execute("""
                DO $$ BEGIN
                    -- A foreign key blocks saving a showtime for a room number that does not exist.
                    ALTER TABLE showtimes ADD CONSTRAINT showtimes_cinema_room_number_fkey
                    FOREIGN KEY (cinema_room_number) REFERENCES cinema_rooms(room_number) ON DELETE RESTRICT;
                -- Ignore the error when the constraint was already created by an earlier startup.
                EXCEPTION WHEN duplicate_object THEN NULL; END $$;
            """)

            #Automatically update modified time whenever a record changes.
            #One shared PostgreSQL function updates modified time for every changed record.
            cur.execute("""
                CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
                BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
            """)
            for table in ("users", "movies", "cinema_rooms", "cinema_room_images", "seats", "showtimes", "bookings", "booking_seats"):
                #Recreate the trigger safely so every listed table receives the same behavior.
                cur.execute(f"DROP TRIGGER IF EXISTS {table}_updated_at ON {table};")
                cur.execute(f"CREATE TRIGGER {table}_updated_at BEFORE UPDATE ON {table} FOR EACH ROW EXECUTE FUNCTION set_updated_at();")

            conn.commit()
            print("[Migrations] PostgreSQL tables verified and up to date.")
    except Exception as error:
        print(f"[Migrations] Warning: could not run migrations immediately: {error}")
    finally:
        if conn:
            conn.close()
