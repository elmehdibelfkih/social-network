CREATE TABLE
  IF NOT EXISTS group_events (
    id INTEGER PRIMARY KEY UNIQUE,
    group_id INTEGER NOT NULL,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    event_start_date TEXT NOT NULL,
    event_end_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE RESTRICT
  );

CREATE INDEX IF NOT EXISTS idx_group_events_group_id ON group_events (group_id);

CREATE INDEX IF NOT EXISTS idx_group_events_creator_id ON group_events (creator_id);

CREATE INDEX IF NOT EXISTS idx_group_events_event_start_date ON group_events (event_start_date);

CREATE INDEX IF NOT EXISTS idx_group_events_event_end_date ON group_events (event_end_date);