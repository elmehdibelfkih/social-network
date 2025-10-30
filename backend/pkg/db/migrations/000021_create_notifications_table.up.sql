CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY ,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN (
    'follow_request','group_invite','event_created',
    'post_liked','post_commented','custom'
  )),
  reference_type TEXT,
  reference_id INTEGER,
  content TEXT,
  is_read INTEGER NOT NULL DEFAULT 0 CHECK(is_read IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_isread ON notifications(user_id, is_read);