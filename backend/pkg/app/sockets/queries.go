package socket

const (
	// select
	SELECT_USER_CHATS = `
		SELECT cp.chat_id
		FROM chat_participants AS cp
		JOIN chats AS c ON c.id = cp.chat_id
		WHERE cp.user_id = ?
		AND c.status = 'active';
	`
	SELECT_USER_BY_ID = `
		SELECT first_name, last_name ,nickname, date_of_birth, avatar_id, about_me, privacy FROM users WHERE id = ?
	`
	SELECT_FOLLOWERS_BY_USER_ID = `
		SELECT u.id, u.nickname, u.email, u.first_name, u.last_name, u.date_of_birth, u.avatar_id, u.about_me, u.privacy
		FROM users u
		JOIN follows f
			ON (f.follower_id = ? AND f.followed_id = u.id)
			OR (f.follower_id = u.id AND f.followed_id = ?)
		WHERE 
			(u.privacy = 'public' AND f.status = 'accepted')
			OR 
			(u.privacy = 'private' AND f.follower_id = u.id AND f.followed_id = ? AND f.status = 'accepted')
 
	`
	SELECT_CHAT_USERS = `
		SELECT user_id FROM chat_participants WHERE chat_id = ?
	`
	SELECT_SHARED_CHAT = `
		SELECT a.chat_id, a.role, a.unread_count
		FROM chat_participants a
		JOIN chat_participants b
    	ON a.chat_id = b.chat_id
		WHERE a.user_id = ? AND b.user_id = ?
	`
	SELECT_MESSAGES_BY_STATUS = `
		SELECT id, chat_id, sender_id, content, seen_status, created_at, updated_at FROM messages WHERE chat_id = ? AND sender_id <> ? AND seen_status = ?
	`

	// update
	UPDATE_MESSAGE_STATUS = `
		UPDATE messages SET seen_status = ? WHERE chat_id = ? AND sender_id <> ? AND seen_status = 'sent'
		RETURNING id, chat_id, sender_id, content, seen_status, created_at, updated_at
	`
)
