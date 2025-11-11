package chat

var GetUserChatsQuery = `
SELECT
	c.id AS chat_id,
	CASE WHEN c.is_group = 1 THEN 1 ELSE NULL END AS group_id,
	CASE
		WHEN c.is_group = 1 THEN c.title
		ELSE (
			SELECT u2.first_name || ' ' || u2.last_name
			FROM chat_participants cp2
			JOIN users u2 ON u2.id = cp2.user_id
			WHERE cp2.chat_id = c.id AND cp2.user_id != ?
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
WHERE cp.user_id = ? AND (? = 0 OR c.id > ?)
ORDER BY c.updated_at DESC
LIMIT ?;
`

var GetMessagesQuery = `
SELECT id, sender_id, content, created_at
FROM messages
WHERE chat_id = ? AND (? = 0 OR id < ?)
AND EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = ? AND user_id = ?)
ORDER BY created_at DESC
LIMIT ?;
`

const checkChatParticipantQuery = `
SELECT 1 FROM chat_participants WHERE chat_id = ? AND user_id = ?;
`

const insertMessageQuery = `
INSERT INTO messages (chat_id, sender_id, content, created_at, updated_at)
VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
`

const updateChatTimestampQuery = `
UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?;
`

const getLastInsertedMessageID = `SELECT last_insert_rowid();`

const checkMessageOwnershipQuery = `
SELECT 1 FROM messages WHERE id = ? AND sender_id = ? AND chat_id = ?;
`

const deleteMessageQuery = `
DELETE FROM messages WHERE id = ? AND sender_id = ?;
`

const getParticipantsQuery = `
SELECT 
    cp.user_id,
    COALESCE(u.nickname, u.first_name || ' ' || u.last_name) as username,
    cp.role,
    0 as last_seen_message_id,
    cp.unread_count
FROM chat_participants cp
JOIN users u ON u.id = cp.user_id
WHERE cp.chat_id = ? AND EXISTS (SELECT 1 FROM chat_participants WHERE chat_id = ? AND user_id = ?);
`
