CREATE TABLE
  IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY UNIQUE,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    device TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    session_expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_token ON sessions (session_token);
CREATE UNIQUE INDEX IF NOT EXISTS ux_sessions_token ON sessions (session_token);