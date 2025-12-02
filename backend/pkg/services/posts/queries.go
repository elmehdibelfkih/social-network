package posts

const (
	// Post queries
	QUERY_CREATE_POST = `
		INSERT INTO posts (id, author_id, group_id, content, privacy, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?);
	`

	QUERY_GET_POST_BY_ID = `
		SELECT id, author_id, group_id, content, privacy, created_at, updated_at
		FROM posts
		WHERE id = ?;
	`

	QUERY_UPDATE_POST = `
		UPDATE posts
		SET content = ?, privacy = ?, updated_at = ?
		WHERE id = ? AND author_id = ?;
	`

	QUERY_DELETE_POST = `
		DELETE FROM posts
		WHERE id = ? AND author_id = ?;
	`

	QUERY_GET_USER_POSTS = `
		SELECT id, author_id, group_id, content, privacy, created_at, updated_at
		FROM posts
		WHERE author_id = ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?;
	`

	QUERY_COUNT_USER_POSTS = `
		SELECT COUNT(*)
		FROM posts
		WHERE author_id = ?;
	`

	QUERY_GET_AUTHOR_NICKNAME = `
		SELECT nickname
		FROM users
		WHERE id = ?;
	`

	// Post media queries
	QUERY_INSERT_POST_MEDIA = `
		INSERT INTO post_media (post_id, media_id, ordinal)
		VALUES (?, ?, ?);
	`

	QUERY_GET_POST_MEDIA_IDS = `
		SELECT media_id
		FROM post_media
		WHERE post_id = ?
		ORDER BY ordinal;
	`

	QUERY_DELETE_POST_MEDIA = `
		DELETE FROM post_media
		WHERE post_id = ?;
	`

	// Post allowed viewers queries
	QUERY_INSERT_POST_ALLOWED_VIEWER = `
		INSERT INTO post_allowed_viewers (post_id, user_id)
		VALUES (?, ?);
	`

	QUERY_GET_POST_ALLOWED_VIEWERS = `
		SELECT user_id
		FROM post_allowed_viewers
		WHERE post_id = ?;
	`

	QUERY_DELETE_POST_ALLOWED_VIEWERS = `
		DELETE FROM post_allowed_viewers
		WHERE post_id = ?;
	`

	QUERY_CHECK_POST_ALLOWED_VIEWER = `
		SELECT 1
		FROM post_allowed_viewers
		WHERE post_id = ? AND user_id = ?
		LIMIT 1;
	`

	// Comment queries
	QUERY_CREATE_COMMENT = `
		INSERT INTO comments (id, post_id, author_id, parent_id, content, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?);
	`

	QUERY_GET_COMMENT_BY_ID = `
		SELECT id, post_id, author_id, content, created_at, updated_at
		FROM comments
		WHERE id = ?;
	`

	QUERY_DELETE_COMMENT = `
		DELETE FROM comments
		WHERE id = ? AND author_id = ?;
	`

	QUERY_GET_POST_COMMENTS = `
		SELECT id, post_id, author_id, content, created_at, updated_at
		FROM comments
		WHERE post_id = ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?;
	`

	QUERY_COUNT_POST_COMMENTS = `
		SELECT COUNT(*)
		FROM comments
		WHERE post_id = ?;
	`

	// Comment media queries
	QUERY_INSERT_COMMENT_MEDIA = `
		INSERT INTO comment_media (comment_id, media_id)
		VALUES (?, ?);
	`

	QUERY_GET_COMMENT_MEDIA_IDS = `
		SELECT media_id
		FROM comment_media
		WHERE comment_id = ?;
	`

	// Post reaction queries
	QUERY_CREATE_POST_REACTION = `
		INSERT INTO post_reactions (post_id, user_id, reaction_type, reacted_at)
		VALUES (?, ?, ?, ?);
	`

	QUERY_DELETE_POST_REACTION = `
		DELETE FROM post_reactions
		WHERE post_id = ? AND user_id = ?;
	`

	QUERY_CHECK_POST_REACTION_EXISTS = `
		SELECT 1
		FROM post_reactions
		WHERE post_id = ? AND user_id = ?
		LIMIT 1;
	`

	// Privacy check queries
	QUERY_CHECK_FOLLOW_STATUS = `
		SELECT 1
		FROM follows
		WHERE follower_id = ? AND followed_id = ? AND status = 'accepted'
		LIMIT 1;
	`

	QUERY_CHECK_GROUP_MEMBERSHIP = `
		SELECT 1
		FROM group_members
		WHERE group_id = ? AND user_id = ? AND status = 'accepted'
		LIMIT 1;
	`

	QUERY_GET_USER_PRIVACY = `
		SELECT privacy
		FROM users
		WHERE id = ?;
	`
	// count queries
	QUERY_CREATE_COUNTERS_ENTITY = `
		INSERT INTO counters (entity_type, entity_id, reaction, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?);
	`

)