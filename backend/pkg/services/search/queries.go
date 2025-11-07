package search

const (
	QUERY_GET_SEARCH_USER = `
		SELECT u.id, u.nickname, u.first_name, u.last_name, m.path AS avatar_path 
		FROM users u
		JOIN media m ON u.avatar_id = m.id
		WHERE u.nickname LIKE ? OR u.firstname LIKE ? OR u.lastname LIKE ?
		LIMIT 10;
	`

	QUERY_GET_SEARCH_GROUP = `
		SELECT g.id, g.title, g.description, m.path AS avatar_url
		FROM groups g
		JOIN media m ON g.avatar_id = m.id
		WHERE g.title LIKE ? OR g.description LIKE ?
		LIMIT 10;
	`

	QUERY_GET_SEARCH_POST = `
		SELECT
			p.id,
			p.author_id,
			p.content,
			p.created_at,
			u.id,
			u.nickname AS author_nickname,
			m.path AS avatar_path
		FROM posts p
		JOIN users u ON p.author_id = u.id
		LEFT JOIN follows f ON p.author_id = f.followed_id AND f.follower_id = ?
		LEFT JOIN post_allowed_viewers pav ON p.id = pav.post_id AND pav.user_id = ?
		LEFT JOIN media m ON u.avatar_id = m.id
		WHERE
			p.content LIKE ? OR u.nickname LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?
			AND (
				p.visibility = 'public'
				OR p.author_id = ?
				OR (p.visibility = 'friends' AND f.follower_id)
				OR (p.visibility = 'private' AND pav.user_id)
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

