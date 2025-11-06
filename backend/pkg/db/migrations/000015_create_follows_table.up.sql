CREATE TABLE IF NOT EXISTS follows (
  follower_id INTEGER NOT NULL,
  followed_id INTEGER NOT NULL,
  followed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT "accepted" CHECK (
    status IN ('accepted', 'pending', 'declined')
  ),
  PRIMARY KEY (follower_id, followed_id),
  FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(followed_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (follower_id != followed_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_followed_id ON follows(followed_id);
