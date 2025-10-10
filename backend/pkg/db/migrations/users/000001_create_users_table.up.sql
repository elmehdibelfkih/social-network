CREATE TABLE
    users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        nickname TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        avatar_path TEXT,
        about_me TEXT,
        privacy TEXT CHECK (privacy IN ('public', 'private')) DEFAULT 'public',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );