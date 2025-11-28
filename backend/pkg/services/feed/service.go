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
	if posts == nil {
		return []FeedPostResponseJson{}, true
	}

	return posts, true
}

// GetUserFeedService handles the business logic for user feed
func GetUserFeedService(w http.ResponseWriter, viewerId, profileUserId int64, page, limit int, context string) ([]FeedPostResponseJson, bool) {
	posts, err := GetUserFeed(viewerId, profileUserId, page, limit)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return nil, false
	}

	if posts == nil {
		return []FeedPostResponseJson{}, true
	}

	return posts, true
}

// GetGroupFeedService handles the business logic for group feed
func GetGroupFeedService(w http.ResponseWriter, userId, groupId int64, page, limit int, context string) ([]FeedPostResponseJson, bool) {
	posts, err := GetGroupFeed(userId, groupId, page, limit)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return nil, false
	}

	if posts == nil {
		return []FeedPostResponseJson{}, true
	}

	return posts, true
}
