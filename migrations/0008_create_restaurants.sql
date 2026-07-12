CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL DEFAULT '',
  image_id TEXT REFERENCES images(id),
  price_range TEXT NOT NULL DEFAULT '$$',
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  address TEXT NOT NULL DEFAULT '',
  neighborhood TEXT NOT NULL DEFAULT '',
  distance TEXT,
  phone TEXT NOT NULL DEFAULT '',
  is_open INTEGER NOT NULL DEFAULT 1,
  has_live_music INTEGER NOT NULL DEFAULT 0,
  opening_hours TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  city TEXT,
  booking_type TEXT NOT NULL DEFAULT 'in_app',
  whatsapp_number TEXT,
  external_link TEXT,
  data_source TEXT NOT NULL DEFAULT 'manual_entry'
);

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_neighborhood ON restaurants(neighborhood);
CREATE INDEX IF NOT EXISTS idx_restaurants_open ON restaurants(is_open);
