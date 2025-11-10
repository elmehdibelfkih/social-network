package search

import (
	"social/pkg/config"
	"social/pkg/utils"
)

func SearchUsers(q string, limit, offset int) ([]any, error) {
	searchKeyword := "%" + q + "%"
	rows, err := config.DB.Query(QUERY_GET_SEARCH_USER, searchKeyword, searchKeyword, searchKeyword, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_SEARCH_USER)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res UserSearchResult

		err := rows.Scan(&res.ID, &res.Username, &res.Firstname, &res.Lastname, &res.AvatarPath)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchUsers (scan)")
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func SearchGroups(q string, limit, offset int) ([]any, error) {
	searchTerm := "%" + q + "%"
	rows, err := config.DB.Query(QUERY_GET_SEARCH_GROUP, searchTerm, searchTerm, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_SEARCH_GROUP)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res GroupSearchResult

		err := rows.Scan(&res.ID, &res.Description, &res.Name, &res.AvatarPath)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchGroups (scan)")
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func SearchPosts(q string, searcherID int64, limit, offset int) ([]any, error) {
	contentSearch := "%" + q + "%"

	rows, err := config.DB.Query(QUERY_GET_SEARCH_POST, searcherID, searcherID, contentSearch, contentSearch, contentSearch, contentSearch, searcherID, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_SEARCH_POST)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res PostSearchResult

		err := rows.Scan(&res.ID, &res.Author.ID, &res.Content, &res.CreatedAt, &res.Author.Username, &res.Author.AvatarPath)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchPosts (scan)")
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}
