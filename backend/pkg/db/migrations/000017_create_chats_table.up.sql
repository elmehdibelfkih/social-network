CREATE TABLE IF NOT EXISTS chats (
  id INTEGER PRIMARY KEY,
  group_id INTEGER,
  title TEXT,
  status  TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('suspended', 'active')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chats_group_id ON chats(group_id);