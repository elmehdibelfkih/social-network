CREATE TABLE IF NOT EXISTS counter_deltas (
    id INTEGER PRIMARY KEY ,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    delta INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counter_deltas_entity_key ON counter_deltas(entity_type, entity_id, key);