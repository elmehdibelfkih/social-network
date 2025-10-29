CREATE TABLE
    notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT CHECK (
            type IN ('follow_request', 'group_invite', 'event_created')
        ), -- we can add ours
        reference_id INTEGER, -- i dont know if we will certenly use it
        content TEXT,
        read TEXT CHECK (read IN ('read', 'unread')) DEFAULT 'unread',
        read_at created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );