package media

const (
	QUERY_CREATE_MEDIA = `
		INSERT INTO media (id, owner_id, path, mime, size, purpose, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?);
	`

	QUERY_GET_MEDIA = `
		SELECT id, owner_id, path, mime, size, purpose, created_at
		FROM media
		WHERE id = ?;
	`

	QUERY_GET_MEDIA_OWNER_AND_PURPOSE = `
		SELECT owner_id, purpose
		FROM media
		WHERE id = ?
		LIMIT 1;
	`

	QUERY_GET_MEDIA_OWNER = `
		SELECT owner_id
		FROM media
		WHERE id = ?;
	`

	QUERY_DELETE_MEDIA = `
		DELETE FROM media
		WHERE id = ? AND owner_id = ?;
	`

	QUERY_GET_MEDIA_BY_USER = `
		SELECT id, owner_id, path, mime, purpose, created_at
		FROM media
		WHERE owner_id = ?
		ORDER BY created_at DESC;
	`

	QUERY_GET_MEDIA_BY_USER_AND_PURPOSE = `
		SELECT id, owner_id, path, mime, purpose, created_at
		FROM media
		WHERE owner_id = ? AND purpose = ?
		ORDER BY created_at DESC;
	`

	QUERY_GET_MEDIA_BATCH_BY_USER = `
		SELECT id, owner_id, path, mime, purpose
		FROM media
		WHERE owner_id = ? AND id IN (?, ?, ?);
	`
	QUERY_UPDATE_MEDIA_PURPOSE = `
		UPDATE media
		SET purpose = ?
		WHERE id = ? AND owner_id = ?;
	`

	QUERY_CHECK_MEDIA_OWNERSHIP = `
		SELECT COUNT(1)
		FROM media
		WHERE id = ? AND owner_id = ?;
	`

	QUERY_GET_POST_VISIBILITY_AND_AUTHOR_FROM_MEDIA = `
		SELECT p.privacy, p.author_id 
		FROM posts p 
		JOIN post_media pm ON p.id = pm.post_id 
		WHERE pm.media_id = ?
		LIMIT 1;
	`

	QUERY_CHECK_FOLLOW = `
		SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ? AND status = 'accepted' LIMIT 1;
	`

	QUERY_GET_USER_PRIVACY = `
		SELECT privacy FROM users WHERE id = ?;
	`

	QUERY_GET_POST_VISIBILITY_FROM_POST_MEDIA = `
		SELECT p.id, p.privacy, p.author_id 
		FROM posts p 
		JOIN post_media pm ON p.id = pm.post_id 
		WHERE pm.media_id = ?
		LIMIT 1;
	`

	QUERY_CHECK_POST_ALLOWED_VIEWERS = `
		SELECT 1 FROM post_allowed_viewers WHERE post_id = ? AND user_id = ? LIMIT 1
	`

	QUERY_CHECK_MESSAGE_MEDIA_VISIBILITY = `
		SELECT 1
		FROM chat_participants cp
		JOIN messages m ON cp.chat_id = m.chat_id
		JOIN message_media mm ON m.id = mm.message_id
		WHERE mm.media_id = ? AND cp.user_id = ?
		LIMIT 1
	`

	
	QUERY_CHECK_GROUP_MEMBERSHIP = `
		SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'accepted' LIMIT 1
	`
)
