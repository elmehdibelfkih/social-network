CREATE TABLE
    posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        group_id INTEGER, -- CAN BE NULL case of personnal post
        content TEXT,
        image_path TEXT,
        privacy TEXT CHECK (
            privacy IN ('public', 'followers', 'private', 'group')
        ) DEFAULT 'public',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
    );