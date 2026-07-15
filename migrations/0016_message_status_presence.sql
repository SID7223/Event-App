ALTER TABLE conversation_participants ADD COLUMN last_seen TEXT;
ALTER TABLE users ADD COLUMN last_seen TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_status_conv ON messages(conversation_id, status);
CREATE INDEX IF NOT EXISTS idx_participants_last_seen ON conversation_participants(last_seen);
