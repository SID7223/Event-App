-- Migration 0012: Event expiration and featured_until support

ALTER TABLE events ADD COLUMN featured_until TEXT;

CREATE INDEX IF NOT EXISTS idx_events_featured_until ON events(featured_until) WHERE featured_until IS NOT NULL;
