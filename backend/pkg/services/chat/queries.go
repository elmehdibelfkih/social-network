package chat

const (
	// select
	SELECT_CHAT_MEMBER = `
		SELECT 1 FROM chat_participants WHERE chat_id = ? AND user_id = ? AND status = 'active'
	`
	SELECT_UNREAD_COUNT = `
		SELECT unread_count FROM chat_participants WHERE user_id = ?
	`
	SELECT_CHAT_HISTORY = `
		
	`
	//insert
	INSERT_MESSAGE = `
	INSERT INTO messages (id, chat_id, sender_id, content, seen_status)
    VALUES (?, ?, ?, ?, ?)
    RETURNING id, chat_id, sender_id, content, seen_status, created_at, updated_at
	`
	//update
	UPDATE_MESSAGE_STATUS = `
		UPDATE messages SET seen_status = ? WHERE id = ? AND chat_id = ? AND sender_id <> ?
	`
	UPDATE_MESSAGE_READ = `
	UPDATE messages                                                                                                                                           
	SET seen_status = 'read'
	WHERE id IN (
    SELECT id
		FROM messages
		WHERE chat_id = ?
		AND sender_id <> ?
		AND id > ?
		ORDER BY id DESC
		LIMIT ?
	)
	RETURNING id, chat_id, sender_id, content, seen_status, created_at, updated_at;
	`
	//delete
	DELETE_MESSAGE = `
	DELETE FROM messages WHERE id = ? AND chat_id = ? AND sender_id = ?
	`
)
