CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES categories(id),
  image_id TEXT REFERENCES images(id),
  price REAL NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  organizer_id TEXT,
  venue_id TEXT,
  attendees INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  neighborhood TEXT,
  city TEXT NOT NULL DEFAULT 'lahore',
  booking_type TEXT NOT NULL DEFAULT 'in_app',
  external_link TEXT,
  whatsapp_number TEXT,
  data_source TEXT NOT NULL DEFAULT 'manual_entry',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured) WHERE is_featured = 1;
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_neighborhood ON events(neighborhood);
