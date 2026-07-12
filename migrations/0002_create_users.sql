-- Migration 0002: User accounts and auth sessions

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  avatar_id TEXT REFERENCES images(id),
  phone TEXT,
  preferences TEXT DEFAULT '[]',
  plan TEXT DEFAULT 'basic',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON auth_sessions(user_id);
