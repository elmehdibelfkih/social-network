CREATE TABLE
    chat_participants (
        chat_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL ,
        unread_count INTEGER DEFAULT 0,
        last_seen_message_id INTEGER REFERENCES messages (id) ON DELETE SET NULL,
        last_read_at DATETIME DEFAULT NULL,
        role TEXT CHECK (role IN ('member', 'admin', 'owner')) DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (chat_id, user_id)
        FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    );