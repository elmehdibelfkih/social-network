CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY UNIQUE,
  creator_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  -- is_public INTEGER NOT NULL DEFAULT 1 CHECK(is_public IN (0, 1)),
  avatar_media_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(creator_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(avatar_media_id) REFERENCES media(id) ON DELETE
  SET
    NULL
);

CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_id);

CREATE INDEX IF NOT EXISTS idx_groups_avatar ON groups(avatar_media_id);