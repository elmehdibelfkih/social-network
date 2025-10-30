CREATE TABLE media (
    id INTEGER PRIMARY KEY, -- We will provide the unique ID from id-generator
    owner_id INTEGER NOT NULL,
    path TEXT NOT NULL,
    mime TEXT NOT NULL,
    purpose TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
