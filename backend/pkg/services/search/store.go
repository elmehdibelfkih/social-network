package search

import (
	"social/pkg/config"
	"social/pkg/utils"
)

func SearchUsers(q string) ([]any, error) {
	var query string
	var args []interface{}
	
	if q == "" {
		query = `SELECT u.id, u.nickname, u.first_name, u.last_name, u.avatar_id, u.privacy FROM users u LIMIT 11`
	} else {
		searchKeyword := "%" + q + "%"
		query = QUERY_GET_SEARCH_USER
		args = []interface{}{searchKeyword, searchKeyword, searchKeyword, searchKeyword}
	}
	
	rows, err := config.DB.Query(query, args...)
	if err != nil {
		utils.SQLiteErrorTarget(err, query)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res UserSearchResult

		err := rows.Scan(&res.ID, &res.Username, &res.Firstname, &res.Lastname, &res.AvatarId, &res.Privacy)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchUsers (scan)")
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func SearchGroups(q string) ([]any, error) {
	var query string
	var args []interface{}
	
	if q == "" {
		query = `SELECT g.id, g.title, g.description, g.avatar_id, g.creator_id FROM groups g LIMIT 10`
	} else {
		searchTerm := "%" + q + "%"
		query = QUERY_GET_SEARCH_GROUP
		args = []interface{}{searchTerm, searchTerm}
	}
	
	rows, err := config.DB.Query(query, args...)
	if err != nil {
		utils.SQLiteErrorTarget(err, query)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res GroupSearchResult

		err := rows.Scan(&res.ID, &res.Name, &res.Description, &res.AvatarId, &res.CreatorId)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchGroups (scan)")
			return nil, err
		}
		
		// Get member count from counters table
		err = config.DB.QueryRow(`SELECT COALESCE(followers_count, 0) FROM counters WHERE entity_type = 'group' AND entity_id = ?`, res.ID).Scan(&res.MemberCount)
		if err != nil {
			res.MemberCount = 0 // Default to 0 if no counter exists
		}
		
		results = append(results, res)
	}
	return results, nil
}

func SearchPosts(q string, searcherID int64) ([]any, error) {
	var query string
	var args []interface{}
	
	if q == "" {
		query = `
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
			WHERE (
				p.privacy = 'public'
				OR p.author_id = ?
				OR (p.privacy = 'followers' AND f.follower_id IS NOT NULL)
				OR (p.privacy = 'private' AND pav.user_id IS NOT NULL)
			)
			GROUP BY p.id
			ORDER BY p.created_at DESC
			LIMIT 10`
		args = []interface{}{searcherID, searcherID, searcherID}
	} else {
		contentSearch := "%" + q + "%"
		query = QUERY_GET_SEARCH_POST
		args = []interface{}{searcherID, searcherID, contentSearch, contentSearch, contentSearch, contentSearch, searcherID}
	}

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		utils.SQLiteErrorTarget(err, query)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res PostSearchResult

		err := rows.Scan(&res.ID, &res.AuthorId, &res.Content, &res.Privacy, &res.GroupId, 
			&res.CreatedAt, &res.UpdatedAt, &res.AuthorNickname, &res.AuthorFirstName, &res.AuthorLastName)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchPosts (scan)")
			return nil, err
		}
		
		// Get media IDs
		mediaRows, err := config.DB.Query(`SELECT media_id FROM post_media WHERE post_id = ? ORDER BY ordinal`, res.ID)
		if err == nil {
			defer mediaRows.Close()
			for mediaRows.Next() {
				var mediaId int64
				if err := mediaRows.Scan(&mediaId); err == nil {
					res.MediaIds = append(res.MediaIds, mediaId)
				}
			}
		}
		if res.MediaIds == nil {
			res.MediaIds = []int64{}
		}
		
		// Set default values
		res.Stats.ReactionCount = 0
		res.Stats.CommentCount = 0
		res.IsLikedByUser = false
		
		results = append(results, res)
	}
	return results, nil
}
