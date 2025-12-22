CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  chat_id INTEGER NOT NULL,
  sender_id INTEGER,
  content TEXT,
  seen_status TEXT NOT NULL DEFAULT 'sent' CHECK(seen_status IN ('sent', 'delivered', 'read')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE
  SET
    NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at);