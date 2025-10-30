CREATE TABLE IF NOT EXISTS group_event_responses (
  event_id INTEGER NOT,
  user_id INTEGER NOT NULL,
  response TEXT NOT NULL CHECK(response IN ('going', 'not_going')),
  responded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(event_id, user_id),
  FOREIGN KEY(event_id) REFERENCES group_events(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_group_event_responses_user_id ON group_event_responses(user_id);