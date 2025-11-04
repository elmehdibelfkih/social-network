package users

import (
	"net/http"
	"social/pkg/utils"
)

// GetProfile handles GET /api/v1/users/:user_id/profile
// It returns the public or private view of a user's profile based on privacy rules.
func GetProfile(w http.ResponseWriter, r *http.Request) {
	// Extract user_id from URL path
	profileUserId := utils.GetWildCardValue(w, r, "user_id")
	if profileUserId == 0 {
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}

	// Get current user from context (may be 0 if not logged in)
	viewerUserId := utils.GetUserIdFromContext(r)

	// Call service layer
	response, ok := GetUserProfile(w, profileUserId, viewerUserId, "GetProfile handler")
	if !ok {
		return
	}

	// Return success response
	utils.WriteSuccess(w, http.StatusOK, response)
}

// PutProfile handles PUT /api/v1/users/:user_id/profile
// It updates the owner's profile fields. Authentication required.
func PutProfile(w http.ResponseWriter, r *http.Request) {
	// Extract user_id from URL path
	profileUserId := utils.GetWildCardValue(w, r, "user_id")
	if profileUserId == 0 {
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}

	// Get current user from context
	currentUserId := utils.GetUserIdFromContext(r)
	if currentUserId == 0 {
		utils.Unauthorized(w, "You must be logged in to update your profile.")
		return
	}

	// Validate user owns the profile
	if currentUserId != profileUserId {
		utils.Unauthorized(w, "You can only update your own profile.")
		return
	}

	// Validate and parse JSON request body
	var req UpdateProfileRequestJson
	if !utils.ValidateJsonRequest(w, r, &req, "PutProfile handler") {
		return
	}

	// Call service layer
	response, ok := UpdateUserProfile(w, profileUserId, &req, "PutProfile handler")
	if !ok {
		return
	}

	// Return success response
	utils.WriteSuccess(w, http.StatusOK, response)
}

// PatchProfile handles PATCH /api/v1/users/:user_id/privacy
// It toggles the profile privacy between "public" and "private". Authentication required.
func PatchProfile(w http.ResponseWriter, r *http.Request) {
	// Extract user_id from URL path
	profileUserId := utils.GetWildCardValue(w, r, "user_id")
	if profileUserId == 0 {
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}

	// Get current user from context
	currentUserId := utils.GetUserIdFromContext(r)
	if currentUserId == 0 {
		utils.Unauthorized(w, "You must be logged in to update your profile privacy.")
		return
	}

	// Validate user owns the profile
	if currentUserId != profileUserId {
		utils.Unauthorized(w, "You can only update your own profile privacy.")
		return
	}

	// Validate and parse JSON request body
	var req UpdatePrivacyRequestJson
	if !utils.ValidateJsonRequest(w, r, &req, "PatchProfile handler") {
		return
	}

	// Call service layer
	response, ok := UpdateUserPrivacy(w, profileUserId, &req, "PatchProfile handler")
	if !ok {
		return
	}

	// Return success response
	utils.WriteSuccess(w, http.StatusOK, response)
}

// GetStats handles GET /api/v1/users/:user_id/stats
// It returns counters like posts, followers, following, likes, comments.
func GetStats(w http.ResponseWriter, r *http.Request) {
	// Extract user_id from URL path
	userId := utils.GetWildCardValue(w, r, "user_id")
	if userId == 0 {
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}

	// Call service layer
	response, ok := GetUserStats(w, userId, "GetStats handler")
	if !ok {
		return
	}

	// Return success response
	utils.WriteSuccess(w, http.StatusOK, response)
}
