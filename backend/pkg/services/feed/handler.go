package feed

import (
	"net/http"
	"social/pkg/utils"
)

// Returns personal feed (public posts + followeedcpost + groups post + allowed private post)
func GetFeed(w http.ResponseWriter, r *http.Request) {
	// Get current user from context
	userId := utils.GetUserIdFromContext(r)
	if userId == -1 {
		utils.Unauthorized(w, "You must be logged in to view your feed.")
		return
	}

	// Get pagination parameters from query
	page := utils.GetQuerryPramInt(r, "page")
	limit := utils.GetQuerryPramInt(r, "limit")

	// Set defaults if not provided
	if page <= 0 { page = 1 }
	if limit <= 0 { limit = 20 }
	if limit > 100 { limit = 100 }

	// Call service layer
	response, ok := GetPersonalFeedService(w, userId, int(page), int(limit), "GetFeed handler")
	if ok {
		utils.JsonResponseEncode(w, http.StatusOK, response)
	}
}

// GetFeedUser handles GET /api/v1/users/:user_id/feed
// Returns user's visible posts (respects privacy)
func GetFeedUser(w http.ResponseWriter, r *http.Request) {
	// Get current user from context
	viewerId := utils.GetUserIdFromContext(r)
	if viewerId == -1 {
		utils.Unauthorized(w, "You must be logged in to view feeds.")
		return
	}

	// Extract user_id from URL path
	profileUserId := utils.GetWildCardValue(w, r, "user_id")
	if profileUserId <= 0 {
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}

	// Get pagination parameters from query
	page := utils.GetQuerryPramInt(r, "page")
	limit := utils.GetQuerryPramInt(r, "limit")

	// Set defaults if not provided
	if page <= 0 { page = 1 }
	if limit <= 0 { limit = 20 }
	if limit > 100 { limit = 100 }

	// Call service layer
	response, ok := GetUserFeedService(w, viewerId, profileUserId, int(page), int(limit), "GetFeedUser handler")
	if ok {
		utils.JsonResponseEncode(w, http.StatusOK, response)
	}
}
