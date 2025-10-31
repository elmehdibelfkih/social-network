CREATE TABLE IF NOT EXISTS message_media (
  id INTEGER PRIMARY KEY ,
  message_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  ordinal INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_media_message_id ON message_media(message_id);