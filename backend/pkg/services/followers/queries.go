package follow

const (
	FOLLOW_REQUEST_QUERY = `
		INSERT INTO follows (follower_id, followed_id, status, followed_at)
	SELECT ?, ?, 
	       CASE WHEN privacy = "public" THEN 'accepted' ELSE 'pending' END,
	       CURRENT_TIMESTAMP
	FROM users
	WHERE id = ?;
	`

	UNFOLLOW_REQUEST_QUERY = `
	DELETE FROM follows 
			WHERE follower_id = ? AND followed_id = ?;
	`

	ACCEPT_FOLLOW_REQUEST_QUERY  = ``
	DECLINE_FOLLOW_REQUEST_QUERY = ``

	FOLLOWERS_LIST_QUERY      = ``
	FOLLOWEEES_LIST_QUERY     = ``
	FOLLOW_REQUEST_LIST_QUERY = ``

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
	WHERE f.followed_id = ?
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
	WHERE f.follower_id = ?
	ORDER BY f.followed_at DESC;`

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
