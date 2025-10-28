CREATE TABLE
    post_reactions (
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        reaction TEXT CHECK (reaction IN ('like', 'dislike')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
    );