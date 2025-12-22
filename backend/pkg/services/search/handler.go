package search

import (
	"net/http"
	"strings"

	"social/pkg/utils"
)

func HandleSearch(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)

	q := r.URL.Query().Get("q")
	q = strings.Trim(q, " ")

	searchType := r.URL.Query().Get("type")
	if searchType != "users" && searchType != "groups" && searchType != "posts" {
		utils.BadRequest(w, "Invalid search 'type'. Must be 'users', 'groups', or 'posts'.", utils.ErrorTypeAlert)
		return
	}

	results, err := GetSearchResults(userID, q, searchType)
	if err != nil {
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, results)
}
