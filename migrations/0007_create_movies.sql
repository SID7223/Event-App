CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT '[]',
  duration INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  poster_id TEXT REFERENCES images(id),
  release_date TEXT,
  synopsis TEXT NOT NULL DEFAULT '',
  director TEXT NOT NULL DEFAULT '',
  cast TEXT NOT NULL DEFAULT '[]',
  age_rating TEXT NOT NULL DEFAULT '',
  city TEXT,
  booking_type TEXT NOT NULL DEFAULT 'in_app',
  external_link TEXT,
  whatsapp_number TEXT,
  data_source TEXT NOT NULL DEFAULT 'manual_entry'
);

CREATE TABLE IF NOT EXISTS cinemas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  neighborhood TEXT NOT NULL DEFAULT '',
  city TEXT
);

CREATE TABLE IF NOT EXISTS showtimes (
  id TEXT PRIMARY KEY,
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  cinema_id TEXT NOT NULL REFERENCES cinemas(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT '2D' CHECK(format IN ('2D', '3D', 'IMAX', '4DX')),
  price REAL NOT NULL DEFAULT 0,
  available_seats INTEGER NOT NULL DEFAULT 0,
  booking_type TEXT NOT NULL DEFAULT 'in_app',
  external_link TEXT,
  whatsapp_number TEXT,
  data_source TEXT NOT NULL DEFAULT 'manual_entry',
  city TEXT
);

CREATE INDEX IF NOT EXISTS idx_showtimes_movie ON showtimes(movie_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_cinema ON showtimes(cinema_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_date ON showtimes(date);
CREATE INDEX IF NOT EXISTS idx_showtimes_city ON showtimes(city);
