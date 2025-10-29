CREATE TABLE
    group_event_responses (
        user_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        response TEXT CHECK (response IN ('going', 'not_going')) NOT NULL,
        PRIMARY KEY (user_id, event_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES group_events (id) ON DELETE CASCADE
    );