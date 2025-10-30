
CREATE TABLE IF NOT EXISTS comment_reactions (
  comment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reaction_type TEXT NOT NULL CHECK(reaction_type IN ('like','dislike','love','laugh','sad','angry')),
  reacted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id),
  FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id)   REFERENCES users(id)    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
