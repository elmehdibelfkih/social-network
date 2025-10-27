CREATE TABLE
    chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT CHECK (type IN ('private', 'group')),
        group_id INTEGER DEFAULT NULL,
        last_message_id INTEGER DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
        FOREIGN KEY (last_message_id) REFERENCES messages (id) ON DELETE CASCADE
    );