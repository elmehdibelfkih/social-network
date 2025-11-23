package socket

// select
const (
	SELECT_FOLLOWERS_BY_USER_ID = `
		SELECT u.id, u.nickname, u.email, u.first_name, u.last_name, u.data_of_birth, u.avatar_id, u.about_me, u.privacy
		FROM users u
		JOIN follows f
			ON (f.follower_id = ? AND f.followed_id = u.id)
			OR (f.follower_id = u.id AND f.followed_id = ?)
		WHERE 
			(u.privacy = 'public' AND f.status = 'accepted')
			OR 
			(u.privacy = 'private' AND f.follower_id = u.id AND f.followed_id = ? AND f.status = 'accepted');
 
	`
)
