CREATE TABLE IF NOT EXISTS post_media (
  post_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  ordinal INTEGER NOT NULL DEFAULT 0 ,
  PRIMARY KEY (post_id, media_id),
  FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_media_media_id ON post_media(media_id);