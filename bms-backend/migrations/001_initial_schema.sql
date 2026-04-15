CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    refresh_token TEXT,
    email_verification_token TEXT,
    email_verification_expires_at TIMESTAMP,
    password_reset_token TEXT,
    password_reset_expires_at TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
UPDATE users
SET role = 'user'
WHERE role IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE IF NOT EXISTS movies (
    movieid SERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description TEXT DEFAULT '',
    poster_url TEXT DEFAULT '',
    language VARCHAR(50) NOT NULL DEFAULT 'Hindi',
    genre VARCHAR(80) NOT NULL DEFAULT 'Drama',
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT REFERENCES users(userid) ON DELETE
    SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (end_date >= start_date)
);
DROP TRIGGER IF EXISTS set_movies_updated_at ON movies;
CREATE TRIGGER set_movies_updated_at BEFORE
UPDATE ON movies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE IF NOT EXISTS shows (
    showid SERIAL PRIMARY KEY,
    movieid INT NOT NULL REFERENCES movies(movieid) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    screen_name VARCHAR(30) NOT NULL DEFAULT 'Audi 1',
    show_price NUMERIC(10, 2) NOT NULL DEFAULT 250,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (movieid, starts_at)
);
CREATE INDEX IF NOT EXISTS shows_movieid_idx ON shows (movieid);
CREATE INDEX IF NOT EXISTS shows_starts_at_idx ON shows (starts_at);
CREATE TABLE IF NOT EXISTS show_seats (
    seatid SERIAL PRIMARY KEY,
    showid INT NOT NULL REFERENCES shows(showid) ON DELETE CASCADE,
    seat_number INT NOT NULL CHECK (
        seat_number BETWEEN 1 AND 50
    ),
    seat_label VARCHAR(10) NOT NULL,
    seat_status VARCHAR(20) NOT NULL DEFAULT 'available',
    booked_by INT REFERENCES users(userid) ON DELETE
    SET NULL,
        booked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (showid, seat_number),
        UNIQUE (showid, seat_label),
        CHECK (seat_status IN ('available', 'booked'))
);
CREATE INDEX IF NOT EXISTS show_seats_showid_idx ON show_seats (showid);
CREATE INDEX IF NOT EXISTS show_seats_status_idx ON show_seats (seat_status);
CREATE TABLE IF NOT EXISTS bookings (
    bookingid SERIAL PRIMARY KEY,
    userid INT NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    showid INT NOT NULL REFERENCES shows(showid) ON DELETE CASCADE,
    show_seat_id INT NOT NULL REFERENCES show_seats(seatid) ON DELETE RESTRICT,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (show_seat_id),
    CHECK (booking_status IN ('confirmed', 'cancelled'))
);
CREATE INDEX IF NOT EXISTS bookings_userid_idx ON bookings (userid);
CREATE INDEX IF NOT EXISTS bookings_showid_idx ON bookings (showid);