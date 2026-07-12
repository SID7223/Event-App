-- Migration 0011: Newsletter subscribers

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL DEFAULT 'lahore',
  ip_address TEXT,
  user_agent TEXT,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  unsubscribe_token TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_city ON newsletter_subscribers(city);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON newsletter_subscribers(unsubscribe_token);
