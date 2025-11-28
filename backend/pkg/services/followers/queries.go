package follow

const (
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
		u.id AS userId,
		u.nickname,
		u.first_name AS firstName,
		u.last_name AS lastName,
		u.avatar_id AS avatarId,
		f.followed_at AS followedAt,
		f.status
	FROM follows f
	JOIN users u ON f.follower_id = u.id
	WHERE f.followed_id = ? AND status = "accepted"
	ORDER BY f.followed_at DESC;
	`

	GET_FOLLOWEES_QUERY = `
	SELECT 
	  u.id AS userId,
	  u.nickname,
	  u.first_name AS firstName,
	  u.last_name AS lastName,
	  u.avatar_id AS avatarId,
	  f.followed_at AS followedAt,
	  f.status
	FROM follows f
	JOIN users u ON f.followed_id = u.id
	WHERE f.follower_id = ? AND status = "accepted"
	ORDER BY f.followed_at DESC;`

	GET_FOLLOW_REQUEST_QUERY = `
	SELECT
	  f.follower_id            AS userId,
	  u.nickname               AS nickname,
	  u.first_name             AS firstName,
	  u.last_name              AS lastName,
	  u.avatar_id              AS avatarId,
	  f.followed_at            AS followedAt,
	  f.status                 AS status
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
