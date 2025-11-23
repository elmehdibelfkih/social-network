package users

import (
	"fmt"
	"net/http"


	"social/pkg/utils"
)
// return profile based on privacy rules (public / private)
func GetProfile(w http.ResponseWriter, r *http.Request) {
	// Extract user_id from URL path
	fmt.Println("xxxxxxxx", r)
	profileUserId := utils.GetWildCardValue(w, r, "user_id")
	if profileUserId == 0 {
		fmt.Println("x", profileUserId)
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}
	// Get current user from context
	viewerUserId := utils.GetUserIdFromContext(r)
	if viewerUserId == -1 {
		fmt.Println("!!!!!", profileUserId)

		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}
	// Call service layer
	fmt.Println("-------", profileUserId, viewerUserId)
	response, ok := GetUserProfile(w, profileUserId, viewerUserId, "GetProfile handler")
	if !ok {
		return
	}

	// Return success response
	utils.WriteSuccess(w, http.StatusOK, response)
}

// updates the owner's profile fields
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
	if !utils.ValidateJsonRequest(w, r, &req, "Put Profile handler") {
		return
	}

	// Call service layer
	response, ok := UpdateUserProfile(w, profileUserId, &req, "Put Profile handler")
	if !ok {
		return
	}

	// Return success response
	utils.WriteSuccess(w, http.StatusOK, response)
}

// toggles the profile privacy between "public" and "private".
func PatchProfile(w http.ResponseWriter, r *http.Request) {
	// Extract user_id from URL path
	profileUserId := utils.GetWildCardValue(w, r, "user_id")
	if profileUserId == 0 {
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}

	// Get current user from context
	currentUserId := utils.GetUserIdFromContext(r)
	if currentUserId == -1 {
		utils.Unauthorized(w, "You must be logged in to update your profile privacy.")
		return
	}

	//  var currentUserId int64 = 55
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

// It returns counters like posts, followers, following, likes, comments.
func GetStats(w http.ResponseWriter, r *http.Request) {
	// Extract user_id from URL path
	userId := utils.GetWildCardValue(w, r, "user_id")
	if userId == 0 {
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}

	// Call service layer
	response, ok := GetUserStats(w, userId, "Get Stats handler")
	if !ok {
		return
	}

	// Return success response
	utils.WriteSuccess(w, http.StatusOK, response)
}
