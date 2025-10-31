CREATE TABLE IF NOT EXISTS follows (
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  followed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);