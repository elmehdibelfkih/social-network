package search

const (
	QUERY_GET_SEARCH_USER = `
		SELECT u.id, u.nickname, u.first_name, u.last_name, u.avatar_id, u.privacy
		FROM users u
		WHERE u.nickname LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR (u.first_name || ' ' || u.last_name) LIKE ?
		LIMIT 10;
	`

	QUERY_GET_SEARCH_GROUP = `
		SELECT g.id, g.title, g.description, g.avatar_id, g.creator_id
		FROM groups g
		WHERE g.title LIKE ? 
		LIMIT 10;
	`

	QUERY_GET_SEARCH_POST = `
		SELECT
			p.id,
			p.author_id,
			p.content,
			p.privacy,
			p.group_id,
			p.created_at,
			p.updated_at,
			u.nickname AS author_nickname,
			u.first_name AS author_first_name,
			u.last_name AS author_last_name
		FROM posts p
		JOIN users u ON p.author_id = u.id
		LEFT JOIN follows f ON p.author_id = f.followed_id AND f.follower_id = ? AND f.status = 'accepted'
		LEFT JOIN post_allowed_viewers pav ON p.id = pav.post_id AND pav.user_id = ?
		WHERE
			(p.content LIKE ? OR u.nickname LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)
			AND (
				p.privacy = 'public'
				OR p.author_id = ?
				OR (p.privacy = 'followers' AND f.follower_id IS NOT NULL)
				OR (p.privacy = 'private' AND pav.user_id IS NOT NULL)
			)
		GROUP BY p.id
		ORDER BY p.created_at DESC
		LIMIT 10;
	`
)

// get posts => Add the author of each user => Add the media of the author => Add the posts where there is a follow connection
// => Add the posts that are allowed for the searcher to see by his friend.
// This gives us a combination of all possible posts but the posts are duplicated
// We gonna select only the ones that are public or it's his own posts, or of a friend or private but one of the allowed friends to see it
