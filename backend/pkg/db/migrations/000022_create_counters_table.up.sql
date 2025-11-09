CREATE TABLE IF NOT EXISTS counters (
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  followers_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  reactions_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_counters_entity ON counters(entity_type, entity_id);	// UPDATE_COUNT = `
	// UPDATE counters SET (
	// 	followers_count,
	// 	posts_count = posts_count + 1 CASE entity_type = 3?"user" 
	// 	comments_count,
	// 	reactions_count,
	// 	shares_count,
	// 	updated_at,	
	// )
	// `