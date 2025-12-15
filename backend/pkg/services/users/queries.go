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

	// Get Follow STATUS ('pending'|'accepted'|'declined') or NULL if no relationship
	SELECT_FOLLOW_STATUS = `
		SELECT status 
		FROM follows 
		WHERE follower_id = ? AND followed_id = ?`

	// Get private chat ID between two users
	SELECT_CHAT_ID_BETWEEN_USERS = `
		SELECT c.id 
		FROM chats c
		INNER JOIN chat_participants cp1 ON c.id = cp1.chat_id
		INNER JOIN chat_participants cp2 ON c.id = cp2.chat_id
		WHERE c.group_id IS NULL
		  AND cp1.user_id = ?
		  AND cp2.user_id = ?
		LIMIT 1`

	// Get user privacy setting
	SELECT_USER_PRIVACY = `
		SELECT privacy 
		FROM users 
		WHERE id = ?`

	// Count posts by user
	SELECT_POSTS_COUNT = `
		SELECT COALESCE(posts_count, 0) 
		FROM counters 
		WHERE entity_id = ? AND entity_type = 'user'`

	// Count followers
	SELECT_FOLLOWERS_COUNT = `
		SELECT COALESCE(followers_count, 0)
		FROM counters 
		WHERE entity_id = ? AND entity_type = 'user'`

	// Count following
	SELECT_FOLLOWING_COUNT = `
		SELECT COALESCE(followes_count, 0) 
		FROM counters 
		WHERE entity_id = ? AND entity_type = 'user'`

	// Get likes received count from counters table for user
	SELECT_LIKES_RECEIVED = `
		SELECT COALESCE(reactions_count, 0)
		FROM counters
		WHERE entity_id = ? AND entity_type = 'user'`

	// Get comments received count from counters table for user
	SELECT_COMMENTS_RECEIVED = `
		SELECT COALESCE(comments_count, 0)
		FROM counters
		WHERE entity_id = ? AND entity_type = 'user'`

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
