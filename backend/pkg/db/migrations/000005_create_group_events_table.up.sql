CREATE TABLE
  IF NOT EXISTS group_events (
    id INTEGER PRIMARY KEY UNIQUE,
    group_id INTEGER NOT NULL,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    start_at TEXT NOT NULL,
    end_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE RESTRICT
  );

CREATE INDEX IF NOT EXISTS idx_group_events_group_id ON group_events (group_id);

CREATE INDEX IF NOT EXISTS idx_group_events_creator_id ON group_events (creator_id);

CREATE INDEX IF NOT EXISTS idx_group_events_start_at ON group_events (start_at);

CREATE INDEX IF NOT EXISTS idx_group_events_end_at ON group_events (end_at);