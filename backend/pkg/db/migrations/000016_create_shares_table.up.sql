CREATE TABLE IF NOT EXISTS shares (
  id INTEGER PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  shared_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  comment TEXT,
  FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);

CREATE INDEX IF NOT EXISTS idx_shares_post_id ON shares(post_id);