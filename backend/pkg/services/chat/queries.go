package chat

const (
	// select

	//insert
	INSERT_MESSAGE = `
	INSERT INTO messages (id, chat_id, sender_id, content, seen_status)
    VALUES (?, ?, ?, ?, ?)
    RETURNING id, chat_id, sender_id, content, seen_status, created_at, updated_at
	`
)
