package users

// SQL queries used by the Users/Profile feature.

const (
	SELECT_USERID_BY_SESSION = `SELECT user_id FROM sessions WHERE session_token = ?`

	// Get full user profile data
	SELECT_USER_PROFILE_BY_ID = `
		SELECT 
			id, email, nickname, first_name, last_name, 
			date_of_birth, avatar_id, about_me, privacy, created_at
		FROM users 
		WHERE id = ?`

	// Get basic user info for privacy checks
	SELECT_USER_BASIC_BY_ID = `
		SELECT id, privacy 
		FROM users 
		WHERE id = ?`

	// Check if follower follows following
	SELECT_FOLLOW_STATUS = `
		SELECT COUNT(*) 
		FROM follows 
		WHERE follower_id = ? AND following_id = ?`

	// Get user privacy setting
	SELECT_USER_PRIVACY = `
		SELECT privacy 
		FROM users 
		WHERE id = ?`

	// Count posts by user
	SELECT_POSTS_COUNT = `
		SELECT COUNT(*) 
		FROM posts 
		WHERE author_id = ? AND group_id IS NULL`

	// Count followers
	SELECT_FOLLOWERS_COUNT = `
		SELECT COUNT(*) 
		FROM follows 
		WHERE following_id = ?`

	// Count following
	SELECT_FOLLOWING_COUNT = `
		SELECT COUNT(*) 
		FROM follows 
		WHERE follower_id = ?`

	// Count likes received on user's posts
	SELECT_LIKES_RECEIVED = `
		SELECT COUNT(*) 
		FROM post_reactions pr
		INNER JOIN posts p ON pr.post_id = p.id
		WHERE p.author_id = ? AND p.group_id IS NULL`

	// Count comments received on user's posts
	SELECT_COMMENTS_RECEIVED = `
		SELECT COUNT(*) 
		FROM comments c
		INNER JOIN posts p ON c.post_id = p.id
		WHERE p.author_id = ? AND p.group_id IS NULL AND c.author_id != ?`

	// Check email uniqueness (excluding current user)
	SELECT_EMAIL_EXISTS = `
		SELECT COUNT(*) 
		FROM users 
		WHERE email = ? AND id != ?`

	// Check nickname uniqueness (excluding current user)
	SELECT_NICKNAME_EXISTS = `
		SELECT COUNT(*) 
		FROM users 
		WHERE nickname = ? AND id != ? AND nickname IS NOT NULL`
)

// insert

const ()

// update

const (
	// Update user profile fields
	UPDATE_USER_PROFILE = `
		UPDATE users 
		SET 
			first_name = ?,
			last_name = ?,
			nickname = ?,
			about_me = ?,
			avatar_id = ?,
			date_of_birth = ?,
			email = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?`

	// Update user privacy setting
	UPDATE_USER_PRIVACY = `
		UPDATE users 
		SET 
			privacy = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = ?`
)

// delete

const ()
