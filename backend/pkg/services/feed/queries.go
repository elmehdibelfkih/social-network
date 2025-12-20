package feed

// Get  personal feed (public posts + followeedpost + groups post + allowed private post)
const (
	SELECT_PERSONAL_FEED = `
		SELECT 
			p.id,
			p.author_id,
			u.nickname,
			u.last_name,
			u.first_name,
			p.content,
			p.privacy,
			p.group_id,
			p.created_at,
			p.updated_at
		FROM posts p
		JOIN users u ON p.author_id = u.id
		WHERE p.privacy = 'public'
		   OR (p.privacy = 'followers' AND EXISTS (
			   SELECT 1 FROM follows 
			   WHERE follower_id = ? AND followed_id = p.author_id AND status = 'accepted'
		   ))
		   OR (p.privacy = 'private' AND EXISTS (
			   SELECT 1 FROM post_allowed_viewers 
			   WHERE post_id = p.id AND user_id = ?
		   ))
		   OR (p.group_id IS NOT NULL AND EXISTS (
			   SELECT 1 FROM group_members 
			   WHERE group_id = p.group_id AND user_id = ? AND status = 'accepted'
		   ))
		ORDER BY p.created_at DESC
		LIMIT ? OFFSET ?`

	// Get user feed (public posts + followeedpost + allowed private post)
	SELECT_USER_FEED = `
		SELECT 
			p.id,
			p.author_id,
			u.nickname,
			u.last_name,
			u.first_name,
			p.content,
			p.privacy,
			p.group_id,
			p.created_at,
			p.updated_at
		FROM posts p
		JOIN users u ON p.author_id = u.id
		WHERE p.author_id = ?
		  AND p.group_id IS NULL
		  AND (
			-- Author can see all their posts
			p.author_id = ?
			OR
			-- Public posts
			p.privacy = 'public'
			OR
			-- Friends posts (if viewer follows author)
			(p.privacy = 'followers' AND EXISTS (
				SELECT 1 FROM follows 
				WHERE follower_id = ? AND followed_id = p.author_id AND status = 'accepted'
			))
			OR
			-- Private posts (if viewer is in allowed list)
			(p.privacy = 'private' AND EXISTS (
				SELECT 1 FROM post_allowed_viewers 
				WHERE post_id = p.id AND user_id = ?
			))
		  )
		ORDER BY p.created_at DESC
		LIMIT ? OFFSET ?`
	// TODO: check GET the post of the all group members or only the user post
	// Get posts from a specific group (members only)
	SELECT_GROUP_FEED = `
	SELECT 
		p.id,
		p.author_id,
		u.nickname,
		u.last_name,
		u.first_name,
		p.content,
		p.privacy,
		p.group_id,
		p.created_at,
		p.updated_at
	FROM posts p
	JOIN users u ON p.author_id = u.id
	WHERE p.group_id = ?
	  AND p.privacy = 'group'
	ORDER BY p.created_at DESC
	LIMIT ? OFFSET ?`

	// Check if user is group member with accepted status
	SELECT_GROUP_MEMBER_ACCEPTED = `
		SELECT EXISTS (
			SELECT 1 FROM group_members 
			WHERE group_id = ? AND user_id = ? AND status = 'accepted'
		)`

	// Check if user liked a post
	SELECT_USER_LIKED_POST = `
		SELECT 1 
		FROM post_reactions 
		WHERE post_id = ? AND user_id = ? 
		LIMIT 1`

	// Count reactions for a post
	SELECT_POST_REACTION_COUNT = `
		SELECT COALESCE(reactions_count, 0) 
		FROM counters 
		WHERE entity_type = 'post' AND entity_id = ?`

	// Count comments for a post
	SELECT_POST_COMMENT_COUNT = `
		SELECT COALESCE(comments_count, 0) 
		FROM counters 
		WHERE entity_type = 'post' AND entity_id = ?`

	// Get media IDs for a post
	SELECT_POST_MEDIA_IDS = `
		SELECT media_id
		FROM post_media
		WHERE post_id = ?
		ORDER BY media_id`
)
