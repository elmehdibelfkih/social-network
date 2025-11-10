CREATE TABLE
    IF NOT EXISTS remember_me (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        remember_selector TEXT UNIQUE NOT NULL,
        remember_token TEXT NOT NULL,
        remember_expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );