CREATE TABLE IF NOT EXISTS comment_media (
  comment_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  PRIMARY KEY (comment_id, media_id),
  FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_media_media_id ON comment_media(media_id);