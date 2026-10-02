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
    """Create the complete database schema and its initial cinema data."""

    #Prevent two application instances from running this migration concurrently.
    op.execute("SELECT pg_advisory_xact_lock(74839201);")

    #Store customer and administrator accounts.
    op.execute("""
        CREATE TABLE users (
            id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL, username VARCHAR(255), phone VARCHAR(50),
            password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'user',
            status VARCHAR(50) DEFAULT 'active', tier VARCHAR(50) DEFAULT 'MEMBER',
            points INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Store movie information displayed by the application.
    op.execute("""
        CREATE TABLE movies (
            id VARCHAR(255) PRIMARY KEY, title VARCHAR(255) NOT NULL,
            genre TEXT, duration VARCHAR(50), release_date VARCHAR(50),
            age_rating VARCHAR(50), rating REAL DEFAULT 0, votes INTEGER DEFAULT 0,
            status VARCHAR(50) DEFAULT 'showing', featured BOOLEAN DEFAULT FALSE,
            director TEXT, "cast" TEXT, language VARCHAR(100), synopsis TEXT,
            poster TEXT, backdrop TEXT, formats TEXT,
            base_price INTEGER DEFAULT 100000 CHECK (base_price >= 0), trailer_url TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Store physical cinema locations.
    op.execute("""
        CREATE TABLE cinemas (
            id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL, address TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Store the rooms belonging to each cinema. Room size is defined by its row and column totals rather than a separate capacity value.
    op.execute("""
        CREATE TABLE cinema_rooms (
            id VARCHAR(255) PRIMARY KEY,
            cinema_id VARCHAR(255) NOT NULL REFERENCES cinemas(id) ON DELETE RESTRICT,
            type VARCHAR(100) NOT NULL,
            total_rows INTEGER NOT NULL CHECK (total_rows > 0),
            total_cols INTEGER NOT NULL CHECK (total_cols > 0),
            price_per_slot INTEGER DEFAULT 5000000, features TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Store multiple display images for each cinema room.
    op.execute("""
        CREATE TABLE cinema_room_images (
            id VARCHAR(255) PRIMARY KEY,
            cinema_room_id VARCHAR(255) NOT NULL REFERENCES cinema_rooms(id) ON DELETE CASCADE,
            image_url TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Store the seats generated for each room. A seat code only needs to be unique inside its own room, so different rooms can both contain seat A1.
    op.execute("""
        CREATE TABLE seats (
            id VARCHAR(255) PRIMARY KEY,
            cinema_room_id VARCHAR(255) NOT NULL REFERENCES cinema_rooms(id) ON DELETE CASCADE,
            seat_code VARCHAR(20) NOT NULL, seat_type VARCHAR(50) DEFAULT 'standard',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (cinema_room_id, seat_code)
        );
    """)

    #Connect a movie to a room and a date/time. The unique constraint prevents 2 movies from being scheduled in the same room at the same time.
    op.execute("""
        CREATE TABLE showtimes (
            id VARCHAR(255) PRIMARY KEY,
            movie_id VARCHAR(255) NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
            cinema_room_id VARCHAR(255) NOT NULL REFERENCES cinema_rooms(id) ON DELETE RESTRICT,
            show_date DATE NOT NULL, show_time TIME NOT NULL, format VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (cinema_room_id, show_date, show_time)
        );
    """)

    #Store the main booking record for a user and showtime.
    op.execute("""
        CREATE TABLE bookings (
            booking_ref VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
            showtime_id VARCHAR(255) NOT NULL REFERENCES showtimes(id) ON DELETE RESTRICT,
            status VARCHAR(50) DEFAULT 'pending_counter_payment', total_amount INTEGER DEFAULT 0,
            data_json TEXT NOT NULL DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Connect selected seats to a booking. A seat can only be booked once for the same showtime.
    op.execute("""
        CREATE TABLE booking_seats (
            id VARCHAR(255) PRIMARY KEY,
            booking_ref VARCHAR(255) NOT NULL REFERENCES bookings(booking_ref) ON DELETE CASCADE,
            showtime_id VARCHAR(255) NOT NULL REFERENCES showtimes(id) ON DELETE RESTRICT,
            seat_id VARCHAR(255) NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (showtime_id, seat_id)
        );
    """)

    #Create three initial cinema locations for a new database.
    op.execute("""
        INSERT INTO cinemas (id, name, city, address) VALUES
            ('default-cinema-1', 'Rạp phim 1', 'Thành phố 1', 'Địa chỉ 1'),
            ('default-cinema-2', 'Rạp phim 2', 'Thành phố 2', 'Địa chỉ 2'),
            ('default-cinema-3', 'Rạp phim 3', 'Thành phố 3', 'Địa chỉ 3');
    """)

    #Give every initial cinema four rooms: one 120-seat IMAX room and three 50-seat Standard rooms.
    op.execute("""
        INSERT INTO cinema_rooms (id, cinema_id, type, total_rows, total_cols, price_per_slot) VALUES
            ('cinema-1-imax', 'default-cinema-1', 'IMAX', 10, 12, 5000000),
            ('cinema-1-room-2', 'default-cinema-1', 'Standard', 5, 10, 5000000),
            ('cinema-1-room-3', 'default-cinema-1', 'Standard', 5, 10, 5000000),
            ('cinema-1-room-4', 'default-cinema-1', 'Standard', 5, 10, 5000000),
            ('cinema-2-imax', 'default-cinema-2', 'IMAX', 10, 12, 5000000),
            ('cinema-2-room-2', 'default-cinema-2', 'Standard', 5, 10, 5000000),
            ('cinema-2-room-3', 'default-cinema-2', 'Standard', 5, 10, 5000000),
            ('cinema-2-room-4', 'default-cinema-2', 'Standard', 5, 10, 5000000),
            ('cinema-3-imax', 'default-cinema-3', 'IMAX', 10, 12, 5000000),
            ('cinema-3-room-2', 'default-cinema-3', 'Standard', 5, 10, 5000000),
            ('cinema-3-room-3', 'default-cinema-3', 'Standard', 5, 10, 5000000),
            ('cinema-3-room-4', 'default-cinema-3', 'Standard', 5, 10, 5000000);
    """)

    #Generate seat codes from the room dimensions. IMAX rooms receive A1-J12, while Standard rooms receive A1-E10.
    op.execute("""
        INSERT INTO seats (id, cinema_room_id, seat_code)
        SELECT 'seat-' || room.id || '-' || row_code || col_number,
               room.id, row_code || col_number
        FROM cinema_rooms room
        CROSS JOIN unnest(ARRAY['A','B','C','D','E','F','G','H','I','J']) row_code
        CROSS JOIN generate_series(1, 12) col_number
        WHERE ascii(row_code) - ascii('A') + 1 <= room.total_rows
          AND col_number <= room.total_cols;
    """)

    #Automatically refresh updated_at whenever an application record changes.
    op.execute("""
        CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
        BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
    """)

    #Apply the shared timestamp function to every table with updated_at.
    for table in ("users", "movies", "cinemas", "cinema_rooms", "cinema_room_images", "seats", "showtimes", "bookings", "booking_seats"):
        op.execute(f"CREATE TRIGGER {table}_updated_at BEFORE UPDATE ON {table} FOR EACH ROW EXECUTE FUNCTION set_updated_at();")


def downgrade() -> None:
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
