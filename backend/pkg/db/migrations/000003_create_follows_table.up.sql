CREATE TABLE
    follows (
        follower_id INTEGER NOT NULL,
        followed_id INTEGER NOT NULL,
        status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (follower_id, followed_id),
        FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (followed_id) REFERENCES users (id) ON DELETE CASCADE
    );