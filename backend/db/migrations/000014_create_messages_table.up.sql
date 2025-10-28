CREATE TABLE
    messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL REFERENCES chats (id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        content TEXT,
        attachment_path TEXT,
        mime_type TEXT,
        seen TEXT CHECK (seen IN ('seen', 'unseen', 'delivered')) DEFAULT 'delivered',
        seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );