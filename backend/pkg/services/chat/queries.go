package chat

const (
	// select
	SELECT_CHAT_MEMBER = `
		SELECT 1 FROM chat_participants cp
		JOIN chats c ON cp.chat_id = c.id
		WHERE cp.chat_id = ?
  		AND cp.user_id = ?
  		AND c.status = 'active'
		LIMIT 1;
	`
	SELECT_UNREAD_COUNT = `
		SELECT unread_count FROM chat_participants WHERE user_id = ?
	`
	SELECT_CHAT_HISTORY_BEFORE = `
		SELECT id, chat_id, sender_id, content, seen_status, created_at, updated_at FROM messages WHERE chat_id = ? AND id < ?
		ORDER BY id DESC
		LIMIT ?
	`
	SELECT_CHAT_HISTORY = `
		SELECT id, chat_id, sender_id, content, seen_status, created_at, updated_at FROM messages WHERE chat_id = ?
		ORDER BY id DESC
		LIMIT ?
	`
	//insert
	INSERT_MESSAGE = `
	INSERT INTO messages (id, chat_id, sender_id, content, seen_status)
    VALUES (?, ?, ?, ?, ?)
    RETURNING id, chat_id, sender_id, content, seen_status, created_at, updated_at
	`
	//update
	UPDATE_RESET_UNREAD_COUNT = `
		UPDATE chat_participants SET unread_count = 0 WHERE user_id = ?
	`
	UPDATE_MESSAGE_STATUS = `
		UPDATE messages SET seen_status = ? WHERE id <= ? AND chat_id = ? AND sender_id <> ? 
	`
	UPDATE_MESSAGE_READ = `
	UPDATE messages
	SET seen_status = 'read'
	WHERE chat_id = ?
	AND sender_id <> ?
	AND id > ?;
	`
	UPDATE_UNREAD_COUNT = `
		UPDATE chat_participants
		SET unread_count = unread_count + 1
		WHERE chat_id = ?
		AND user_id <> ?;
	`
	//delete
	DELETE_MESSAGE = `
	DELETE FROM messages WHERE id = ? AND chat_id = ? AND sender_id = ?
	`
)
