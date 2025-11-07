package search

import (
	"social/pkg/config"
	"social/pkg/utils"
)

func SearchUsers(q string) ([]any, error) {
	searchKeyword := "%" + q + "%"
	rows, err := config.DB.Query(QUERY_GET_SEARCH_USER, searchKeyword, searchKeyword, searchKeyword)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_SEARCH_USER)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res UserSearchResult

		err := rows.Scan(&res)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchUsers (scan)")
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func SearchGroups(q string) ([]any, error) {
	searchTerm := "%" + q + "%"
	rows, err := config.DB.Query(QUERY_GET_SEARCH_GROUP, searchTerm, searchTerm)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_SEARCH_GROUP)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res GroupSearchResult

		err := rows.Scan(&res)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchGroups (scan)")
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}

func SearchPosts(q string, searcherID int64) ([]any, error) {
	contentSearch := "%" + q + "%"

	rows, err := config.DB.Query(QUERY_GET_SEARCH_GROUP, searcherID, searcherID, contentSearch, searcherID)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_SEARCH_GROUP)
		return nil, err
	}
	defer rows.Close()

	var results []any
	for rows.Next() {
		var res GroupSearchResult

		err := rows.Scan(&res)
		if err != nil {
			utils.SQLiteErrorTarget(err, "searchGroups (scan)")
			return nil, err
		}
		results = append(results, res)
	}
	return results, nil
}
