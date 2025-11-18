package feed

import (
	"net/http"
	"social/pkg/utils"
)

// GetPersonalFeedService handles the business logic for personal feed
func GetPersonalFeedService(w http.ResponseWriter, userId int64, page, limit int, context string) ([]FeedPostResponseJson, bool) {

	posts, err := GetPersonalFeed(userId, page, limit)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return nil, false
	}

	if posts == nil { return []FeedPostResponseJson{}, true}

	return posts, true
}
