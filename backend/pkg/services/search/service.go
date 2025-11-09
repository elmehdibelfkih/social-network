package search

func GetSearchResults(userID int64, q, searchType string) ([]any, error) {
	var results []any
	var err error

	switch searchType {
	case "users":
		results, err = SearchUsers(q)
	case "groups":
		results, err = SearchGroups(q)
	case "posts":
		results, err = SearchPosts(q, userID)
	}

	if err != nil {
		return nil, err
	}

	if results == nil {
		results = make([]any, 0)
	}
	return results, nil
}
