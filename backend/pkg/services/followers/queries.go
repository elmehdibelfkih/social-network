package follow

const (
	UPDATE_CHAT_STATUS = `
	UPDATE chats
	SET status = 'suspended',
    updated_at = CURRENT_TIMESTAMP
	WHERE id = ? AND group_id IS NULL
	`
	SELECT_SHARED_CHATS = `
	SELECT chat_id FROM chat_participants WHERE user_id = ?
	INTERSECT
	SELECT chat_id FROM chat_participants WHERE user_id = ?;
	`
	CREATE_CHAT_ROW = `
		INSERT INTO chats (id) VALUES (?)	
	`
	ADD_CHAT_PARTICIPANT = `
		INSERT INTO chat_participants (chat_id, user_id, unread_count) VALUES (?, ?, ?) 
	`
	FOLLOW_BACK = `
		SELECT EXISTS (
			SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?
		);
	`
	FOLLOW_REQUEST_QUERY = `
	INSERT INTO follows (follower_id, followed_id, status, followed_at)
	SELECT ?, ?, 
	       CASE WHEN u.privacy = 'public' THEN 'accepted' ELSE 'pending' END,
	       CURRENT_TIMESTAMP
	FROM users u
	WHERE u.id = ?
	ON CONFLICT(follower_id, followed_id) DO UPDATE
	  SET status = excluded.status,
	      followed_at = excluded.followed_at;
	`

	UNFOLLOW_REQUEST_QUERY = `
	DELETE FROM follows 
			WHERE follower_id = ? AND followed_id = ?;
	`

	ACCEPT_FOLLOW_REQUEST_QUERY = `
	UPDATE follows
	SET status = 'accepted'
	WHERE follower_id = ?
	  AND followed_id = ?
	  AND status = 'pending';
`

	DECLINE_FOLLOW_REQUEST_QUERY = `
	UPDATE follows
	SET status = 'declined'
	WHERE follower_id = ?
	  AND followed_id = ?
	  AND status = 'pending';
	`

	SELECT_FOLLOW_STATUS_QUERY   = `SELECT status FROM follows WHERE follower_id = ? AND followed_id = ?`
	USER_EXISTS_QUERY            = `SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)`
	IS_USER_PROFILE_PUBLIC_QUERY = `SELECT EXISTS(SELECT 1 FROM users WHERE privacy = "public" AND id = ?)`

	GET_FOLLOWERS_QUERY = `
SELECT
    u.id,
    f_status.status,
    u.nickname,
    u.first_name,
    u.last_name,
    u.avatar_id,
    u.privacy,
    (
		SELECT ch.id
		FROM chats ch
		JOIN chat_participants cp1 ON cp1.chat_id = ch.id AND cp1.user_id = ?
		JOIN chat_participants cp2 ON cp2.chat_id = ch.id AND cp2.user_id = u.id
		LIMIT 1
	) as chatId
FROM follows f
JOIN users u ON u.id = f.follower_id
LEFT JOIN follows f_status ON f_status.follower_id = ? AND f_status.followed_id = u.id
WHERE f.followed_id = ? AND f.status = 'accepted'
`

	GET_FOLLOWEES_QUERY = `
SELECT
    u.id,
    f_status.status,
    u.nickname,
    u.first_name,
    u.last_name,
    u.avatar_id,
    u.privacy,
    (
		SELECT ch.id
		FROM chats ch
		JOIN chat_participants cp1 ON cp1.chat_id = ch.id AND cp1.user_id = ?
		JOIN chat_participants cp2 ON cp2.chat_id = ch.id AND cp2.user_id = u.id
		LIMIT 1
	) as chatId
FROM follows f
JOIN users u ON u.id = f.followed_id
LEFT JOIN follows f_status ON f_status.follower_id = ? AND f_status.followed_id = u.id
WHERE f.follower_id = ? AND f.status = 'accepted'
`

	GET_FOLLOW_REQUEST_QUERY = `
	SELECT
	  f.follower_id            AS userId,
	  f.status                 AS status,
	  u.nickname               AS nickname,
	  u.first_name             AS firstName,
	  u.last_name              AS lastName,
	  u.avatar_id              AS avatarId,
	  u.privacy                AS privacy,
	  (
	    SELECT ch.id
	    FROM chats ch
	    JOIN chat_participants cp1 ON cp1.chat_id = ch.id AND cp1.user_id = ?
	    JOIN chat_participants cp2 ON cp2.chat_id = ch.id AND cp2.user_id = u.id
	    ORDER BY ch.updated_at DESC
	    LIMIT 1
	  ) AS chatId
	FROM follows f
	JOIN users u ON u.id = f.follower_id
	WHERE f.followed_id = ? AND f.status = 'pending'
	ORDER BY f.followed_at DESC`

	INSERT_NOTIFICATION = `
	INSERT INTO notifications (
	    id,
	    user_id,
	    type,
	    reference_type,
	    reference_id,
	    content
	) VALUES (?, ?, ?, ?, ?, ?)
	`
)
