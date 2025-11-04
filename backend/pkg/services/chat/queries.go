package chat

var GetUserChatsQuery = `
SELECT
	c.id AS chat_id,
	-- name is group title for group chats, otherwise the other participant's name
	CASE
		WHEN c.is_group = 1 THEN c.title
		ELSE (
			SELECT u2.first_name || ' ' || u2.last_name
			FROM chat_participants cp2
			JOIN users u2 ON u2.id = cp2.user_id
			WHERE cp2.chat_id = c.id AND cp2.user_id != cp.user_id
			LIMIT 1
		)
	END AS name,
	m.id AS last_message_id,
	m.content AS last_message_text,
	m.created_at AS last_message_created_at,
	cp.unread_count,
	c.updated_at
FROM chat_participants cp
JOIN chats c ON cp.chat_id = c.id
LEFT JOIN messages m ON m.id = (
	SELECT id FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1
)
WHERE cp.user_id = ?
ORDER BY c.updated_at DESC;
`
