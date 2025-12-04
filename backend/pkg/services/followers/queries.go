package follow

const (
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
	  u.id            AS userId,
	  r.status        AS status,
	  u.nickname,
	  u.first_name    AS firstName,
	  u.last_name     AS lastName,
	  u.avatar_id     AS avatarId,
	  u.privacy       AS privacy,
	  (
	    SELECT ch.id
	    FROM chats ch
	    JOIN chat_participants cp1 ON cp1.chat_id = ch.id AND cp1.user_id = ?
	    JOIN chat_participants cp2 ON cp2.chat_id = ch.id AND cp2.user_id = u.id
	    ORDER BY ch.updated_at DESC
	    LIMIT 1
	  ) AS chatId
	FROM follows f
	JOIN users u
	  ON u.id = f.follower_id
	LEFT JOIN follows r
	  ON r.follower_id = ? AND r.followed_id = u.id
	WHERE f.followed_id = ?
	ORDER BY f.followed_at DESC;
	`

	GET_FOLLOWEES_QUERY = `
	SELECT
	  u.id AS userId,
	  f.status,
	  u.nickname,
	  u.first_name AS firstName,
	  u.last_name AS lastName,
	  u.avatar_id AS avatarId,
	  u.privacy,
	  (
	    SELECT ch.id
	    FROM chats ch
	    JOIN chat_participants cp1 ON cp1.chat_id = ch.id AND cp1.user_id = ?
	    JOIN chat_participants cp2 ON cp2.chat_id = ch.id AND cp2.user_id = u.id
	    ORDER BY ch.updated_at DESC
	    LIMIT 1
	  ) AS chatId
	FROM follows f
	JOIN users u ON f.followed_id = u.id
	WHERE f.follower_id = ? AND status = "accepted"
	ORDER BY f.followed_at DESC;`

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
