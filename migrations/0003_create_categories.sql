CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vibes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vibe_categories (
  vibe_id TEXT NOT NULL REFERENCES vibes(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (vibe_id, category_id)
);

INSERT OR IGNORE INTO categories (id, name, icon, color, sort_order) VALUES
  ('cat_music', 'Music', 'music-note', '#00E5FF', 1),
  ('cat_sports', 'Sports', 'football', '#FF9800', 2),
  ('cat_art', 'Art', 'color-palette', '#9C27B0', 3),
  ('cat_festival', 'Festival', 'sparkles', '#E91E63', 4),
  ('cat_tech', 'Technology', 'hardware-chip', '#2196F3', 5),
  ('cat_comedy', 'Comedy', 'happy', '#FF9800', 6),
  ('cat_restaurant', 'Restaurant', 'restaurant', '#F44336', 7),
  ('cat_business', 'Business', 'briefcase', '#00E5FF', 8),
  ('cat_nightlife', 'Nightlife', 'moon', '#9C27B0', 9);

INSERT OR IGNORE INTO vibes (id, label, icon, sort_order) VALUES
  ('live_music', 'Live Music', 'musical-notes', 1),
  ('nightlife', 'Nightlife & DJs', 'headphones', 2),
  ('comedy', 'Comedy & Mic', 'happy', 3),
  ('tech', 'Tech & Startups', 'briefcase', 4),
  ('wellness', 'Wellness', 'leaf', 5),
  ('arts_culture', 'Arts & Culture', 'color-palette', 6),
  ('popups_festivals', 'Pop-ups & Fest', 'sparkles', 7),
  ('workshops', 'Workshops', 'book', 8),
  ('poetry', 'Poetry & Literary', 'pen', 9),
  ('fashion', 'Fashion & Lifestyle', 'shirt', 10),
  ('screenings', 'Match Screenings', 'football', 11),
  ('gaming', 'Gaming & E-Sports', 'game-controller', 12);

INSERT OR IGNORE INTO vibe_categories (vibe_id, category_id) VALUES
  ('live_music', 'cat_music'),
  ('nightlife', 'cat_nightlife'),
  ('comedy', 'cat_comedy'),
  ('tech', 'cat_tech'),
  ('arts_culture', 'cat_art'),
  ('popups_festivals', 'cat_festival'),
  ('workshops', 'cat_tech'),
  ('fashion', 'cat_art');
