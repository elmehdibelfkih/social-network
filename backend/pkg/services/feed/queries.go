package feed

const (
	SELECT_PERSONAL_FEED = `
		SELECT 
			p.id,
			p.author_id,
			u.nickname,
			u.last_name,
			u.first_name,
			p.content,
			p.visibility,
			p.group_id,
			p.created_at,
			p.updated_at
		FROM posts p
		JOIN users u ON p.author_id = u.id
		WHERE p.visibility = 'public'
		   OR (p.visibility = 'friends' AND EXISTS (
			   SELECT 1 FROM follows 
			   WHERE follower_id = ? AND followed_id = p.author_id AND status = 'accepted'
		   ))
		   OR (p.visibility = 'private' AND EXISTS (
			   SELECT 1 FROM post_allowed_viewers 
			   WHERE post_id = p.id AND user_id = ?
		   ))
		   OR (p.group_id IS NOT NULL AND EXISTS (
			   SELECT 1 FROM group_members 
			   WHERE group_id = p.group_id AND user_id = ? AND status = 'accepted'
		   ))
		ORDER BY p.created_at DESC
		LIMIT ? OFFSET ?`

	// Check if user liked a post
	SELECT_USER_LIKED_POST = `
		SELECT 1 
		FROM post_reactions 
		WHERE post_id = ? AND user_id = ? 
		LIMIT 1`

	// Count reactions for a post
	SELECT_POST_REACTION_COUNT = `
		SELECT COUNT(*) 
		FROM post_reactions 
		WHERE post_id = ?`

	// Count comments for a post
	SELECT_POST_COMMENT_COUNT = `
		SELECT COUNT(*) 
		FROM comments 
		WHERE post_id = ?`

	// Get media IDs for a post
	SELECT_POST_MEDIA_IDS = `
		SELECT media_id
		FROM post_media
		WHERE post_id = ?
		ORDER BY media_id`
)
