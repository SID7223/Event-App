-- Migration 0001: Core image storage schema
-- One physical image in R2, many references via image_usages

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  storage_key TEXT NOT NULL UNIQUE,
  original_hash TEXT NOT NULL UNIQUE,
  original_filename TEXT,
  content_type TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  blur_hash TEXT,
  alt_text TEXT,
  attribution TEXT,
  source TEXT NOT NULL DEFAULT 'user_upload',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS image_usages (
  id TEXT PRIMARY KEY,
  image_id TEXT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  usage_type TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  starts_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(entity_type, entity_id, usage_type, image_id)
);

CREATE TABLE IF NOT EXISTS image_variants_config (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  fit TEXT NOT NULL DEFAULT 'cover',
  quality INTEGER NOT NULL DEFAULT 80,
  format TEXT NOT NULL DEFAULT 'auto'
);

CREATE INDEX IF NOT EXISTS idx_usages_entity ON image_usages(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_usages_image ON image_usages(image_id);
CREATE INDEX IF NOT EXISTS idx_usages_expires ON image_usages(expires_at);
CREATE INDEX IF NOT EXISTS idx_images_hash ON images(original_hash);
CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);

INSERT OR IGNORE INTO image_variants_config (id, name, width, height, fit, quality, format) VALUES
  ('var_thumb', 'thumbnail', 150, 150, 'cover', 80, 'auto'),
  ('var_small', 'small', 400, 300, 'cover', 80, 'auto'),
  ('var_medium', 'medium', 800, 600, 'cover', 85, 'auto'),
  ('var_large', 'large', 1200, 900, 'cover', 90, 'auto'),
  ('var_og', 'og', 1200, 630, 'cover', 90, 'jpeg');
