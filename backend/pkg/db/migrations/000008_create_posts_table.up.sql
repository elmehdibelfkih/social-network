CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  author_id INTEGER NOT NULL,
  group_id INTEGER,
  content TEXT,
  privacy TEXT NOT NULL DEFAULT 'public' CHECK(privacy IN ('public', 'followers', 'private','group','restricted')),
  created_at TEXT NOT NULL , 
  updated_at TEXT NOT NULL ,
  FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE
  SET
    NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);

CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);