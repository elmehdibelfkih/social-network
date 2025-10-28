CREATE TABLE
    group_members (
        group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
        role TEXT CHECK (role IN ('member', 'admin')) DEFAULT 'member',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );