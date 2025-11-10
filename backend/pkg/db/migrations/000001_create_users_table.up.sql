CREATE TABLE
  IF NOT EXISTS users (
    id INTEGER PRIMARY KEY UNIQUE,
    email TEXT NOT NULL UNIQUE,
    nickname TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    avatar_id INTEGER,
    about_me TEXT,
    privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public', 'private')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (avatar_id) REFERENCES media (id) ON DELETE SET NULL
  );

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users (email);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_nickname ON users (nickname);