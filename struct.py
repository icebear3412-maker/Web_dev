from app.shared_utils.db import get_db_connection

def run_migrations():
    #Create all required PostgreSQL tables if they don't already exist.
    conn = None
    try:
        conn = get_db_connection(max_retries=3, retry_delay=1)
        with conn.cursor() as cur:
            #Advisory lock prevents parallel Gunicorn workers from colliding during schema creation
            cur.execute("SELECT pg_advisory_xact_lock(74839201);")

            #Users Table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255),
                phone VARCHAR(50),
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                status VARCHAR(50) DEFAULT 'active',
                tier VARCHAR(50) DEFAULT 'MEMBER',
                points INTEGER DEFAULT 0,
                created_at VARCHAR(100)
            );
            """)

            #Movies Table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS movies (
                id VARCHAR(255) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                title_vn VARCHAR(255),
                genre TEXT,
                genre_en TEXT,
                duration VARCHAR(50),
                release_date VARCHAR(50),
                age_rating VARCHAR(50),
                rating REAL DEFAULT 0,
                votes INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'showing',
                featured BOOLEAN DEFAULT FALSE,
                director TEXT,
                "cast" TEXT,
                language VARCHAR(100),
                synopsis TEXT,
                synopsis_en TEXT,
                poster TEXT,
                backdrop TEXT,
                formats TEXT,
                base_price INTEGER DEFAULT 100000,
                trailer_url TEXT
            );
            """)

            #Bookings Table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS bookings (
                booking_ref VARCHAR(255) PRIMARY KEY,
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                status VARCHAR(50) DEFAULT 'pending_counter_payment',
                total_amount INTEGER DEFAULT 0,
                movie_title VARCHAR(255),
                show_date VARCHAR(50),
                show_time VARCHAR(50),
                seats TEXT,
                format VARCHAR(50),
                cinema_name VARCHAR(255),
                created_at VARCHAR(100),
                data_json TEXT NOT NULL
            );
            """)

            # REATE TABLE IF NOT EXISTS does not add columns to an existing table.
            booking_columns = [
                ("customer_name", "VARCHAR(255)"),
                ("customer_email", "VARCHAR(255)"),
                ("customer_phone", "VARCHAR(50)"),
                ("status", "VARCHAR(50) DEFAULT 'pending_counter_payment'"),
                ("total_amount", "INTEGER DEFAULT 0"),
                ("movie_title", "VARCHAR(255)"),
                ("show_date", "VARCHAR(50)"),
                ("show_time", "VARCHAR(50)"),
                ("seats", "TEXT"),
                ("format", "VARCHAR(50)"),
                ("cinema_name", "VARCHAR(255)"),
                ("created_at", "VARCHAR(100)"),
                ("data_json", "TEXT NOT NULL DEFAULT '{}'")
            ]
            for column_name, column_definition in booking_columns:
                cur.execute(
                    f"ALTER TABLE bookings ADD COLUMN IF NOT EXISTS {column_name} {column_definition};"
                )

            #Cinema Rooms Table 
            cur.execute("""
            CREATE TABLE IF NOT EXISTS cinema_rooms (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100),
                capacity INTEGER DEFAULT 100,
                price_per_slot INTEGER DEFAULT 5000000,
                features TEXT,
                image TEXT
            );
            """)

            conn.commit()
            print("[Migrations] PostgreSQL tables verified and up to date.")
    except Exception as e:
        print(f"[Migrations] Warning: could not run migrations immediately: {e}")
    finally:
        if conn:
            conn.close()
