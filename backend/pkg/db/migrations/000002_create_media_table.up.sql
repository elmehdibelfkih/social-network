CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY UNIQUE,
  owner_id INTEGER,
  path TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER,
  purpose TEXT NOT NULL DEFAULT 'post' CHECK(
    purpose IN ('avatar', 'post', 'comment', 'message')
  ),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE
  SET
    NULL
);

CREATE INDEX IF NOT EXISTS idx_media_owner ON media(owner_id);

CREATE INDEX IF NOT EXISTS idx_media_purpose ON media(purpose);