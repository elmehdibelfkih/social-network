package search

func GetSearchResults(userID int64, q, searchType string, page, limit int) ([]any, error) {
	var results []any
	var err error

	offset := (page - 1) * limit

	switch searchType {
	case "users":
		results, err = SearchUsers(q, limit, offset)
	case "groups":
		results, err = SearchGroups(q, limit, offset)
	case "posts":
		results, err = SearchPosts(q, userID, limit, offset)
	}

	if err != nil {
		return nil, err
	}

	if results == nil {
		results = make([]any, 0)
	}
	return results, nil
}
