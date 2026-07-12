-- Migration 0010: Extended user profiles, activity logging, and push tokens

-- ==============================
-- EXTEND USERS TABLE
-- ==============================
ALTER TABLE users ADD COLUMN username TEXT;
ALTER TABLE users ADD COLUMN bio TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN city TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN neighborhood TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN latitude REAL;
ALTER TABLE users ADD COLUMN longitude REAL;
ALTER TABLE users ADD COLUMN country TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN full_address TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN last_login_at TEXT;
ALTER TABLE users ADD COLUMN login_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN push_notifications_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN email_notifications_enabled INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_neighborhood ON users(neighborhood);

-- ==============================
-- USER ACTIVITY LOG (audit trail)
-- ==============================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_log(created_at);

-- ==============================
-- USER PUSH TOKENS (Expo notifications)
-- ==============================
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK(platform IN ('ios', 'android', 'web')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON user_push_tokens(is_active);

-- ==============================
-- USER LOGIN HISTORY
-- ==============================
CREATE TABLE IF NOT EXISTS user_login_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  login_type TEXT NOT NULL CHECK(login_type IN ('google', 'email', 'apple', 'phone')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_history_user ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created ON user_login_history(created_at);

-- ==============================
-- EXTEND EVENTS TABLE
-- ==============================
ALTER TABLE events ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE events ADD COLUMN image_url TEXT;

-- ==============================
-- EXTEND BOOKINGS TABLE
-- ==============================
ALTER TABLE bookings ADD COLUMN contact_phone TEXT;
ALTER TABLE bookings ADD COLUMN notes TEXT;

-- ==============================
-- TICKET TYPES CONFIG (per event)
-- ==============================
CREATE TABLE IF NOT EXISTS ticket_types (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  remaining INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
