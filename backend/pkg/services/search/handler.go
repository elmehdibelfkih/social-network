package search

import (
	"net/http"
	"strconv"

	"social/pkg/utils"
)

func HandleSearch(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)

	q := r.URL.Query().Get("q")
	if q == "" {
		utils.BadRequest(w, "Search query 'q' is required.", utils.ErrorTypeAlert)
		return
	}

	searchType := r.URL.Query().Get("type")
	if searchType != "users" && searchType != "groups" && searchType != "posts" {
		utils.BadRequest(w, "Invalid search 'type'. Must be 'users', 'groups', or 'posts'.", utils.ErrorTypeAlert)
		return
	}

	page, err := utils.GetIntQueryParam(r, "page")
	if err != nil {
		utils.BadRequest(w, err.Error(), utils.ErrorTypeAlert)
		return
	}

	if page < 1 {
		utils.BadRequest(w, "incorrect page parameter", utils.ErrorTypeAlert)
		return
	}

	limit, err := utils.GetIntQueryParam(r, "limit")
	if err != nil {
		utils.BadRequest(w, err.Error(), utils.ErrorTypeAlert)
		return
	}
	if limit > MAX_RESULTS_NUM || limit < 1 {
		utils.BadRequest(w, "limit parameter must be "+strconv.Itoa(MAX_RESULTS_NUM), utils.ErrorTypeAlert)
		return
	}

	results, err := GetSearchResults(userID, q, searchType, page, limit)
	if err != nil {
		utils.InternalServerError(w)
		return
	}

	response := SearchResponse{
		Query:   q,
		Type:    searchType,
		Results: results,
	}

	utils.WriteSuccess(w, http.StatusOK, response)
}
