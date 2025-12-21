package users

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"

	// "social/pkg/services/chat"
	"social/pkg/utils"
)

// GetUserProfile retrieves a user profile with privacy checks
func GetUserProfile(w http.ResponseWriter, profileUserId, viewerUserId int64, context string) (UserProfileResponseJson, bool) {
	var response UserProfileResponseJson

	// Check if profile user exists
	profile, err := SelectUserProfileById(profileUserId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.NotFoundError(w, "User profile not found.")
			return response, false
		}
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	// Get follow status (pending/accepted/declined or null)
	var followStatus *string
	if viewerUserId > 0 && viewerUserId != profileUserId {
		followStatus, err = SelectFollowStatus(viewerUserId, profileUserId)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}
	}

	// Get stats
	postsCount, err := SelectPostsCount(profileUserId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}
	// followes && following COUNT
	followersCount, err := SelectFollowersCount(profileUserId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	followingCount, err := SelectFollowingCount(profileUserId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	// Get chatId if users are different
	var chatId *int64
	if viewerUserId != profileUserId {
		chatId, err = SelectChatIdBetweenUsers(viewerUserId, profileUserId)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}
	}

	// Build response
	response.UserId = profile.Id
	if viewerUserId != profileUserId {
		if followStatus == nil {
			status := "follow"
			response.Status = &status
		} else {
			response.Status = followStatus
		}
	}

	if viewerUserId == profileUserId {
		response.Email = &profile.Email
	}

	response.Nickname = profile.Nickname
	response.FirstName = profile.FirstName
	response.LastName = profile.LastName
	response.AvatarId = profile.AvatarId
	response.AboutMe = profile.AboutMe
	response.DateOfBirth = profile.DateOfBirth
	response.Privacy = profile.Privacy
	response.ChatId = chatId // null if no chat exists or users can't chat
	response.Stats.PostsCount = postsCount
	response.Stats.FollowersCount = followersCount
	response.Stats.FollowingCount = followingCount
	response.JoinedAt = profile.CreatedAt

	return response, true
}

// updates a user's profile
func UpdateUserProfile(w http.ResponseWriter, userId int64, req *UpdateProfileRequestJson, context string) (UpdateProfileResponseJson, bool) {
	var response UpdateProfileResponseJson

	// Get current user profile to merge with updates
	currentProfile, err := SelectUserProfileById(userId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.NotFoundError(w, "User profile not found.")
			return response, false
		}
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	// Prepare update values
	firstName := currentProfile.FirstName
	lastName := currentProfile.LastName
	nickname := currentProfile.Nickname
	aboutMe := currentProfile.AboutMe
	avatarId := currentProfile.AvatarId
	dateOfBirth := currentProfile.DateOfBirth
	email := currentProfile.Email

	if req.FirstName != nil {
		firstName = *req.FirstName
	}
	if req.LastName != nil {
		lastName = *req.LastName
	}
	if req.Nickname != nil {
		// Normalize empty or whitespace-only nicknames to nil (no nickname)
		if strings.TrimSpace(*req.Nickname) == "" {
			nickname = nil
		} else {
			nickname = req.Nickname
		}
	}
	if req.AboutMe != nil {
		aboutMe = req.AboutMe
	}
	// Handle avatar update explicitly (including null values)
	if req.AvatarId != nil {
		if *req.AvatarId == -1 {
			// Special case: -1 means remove avatar (set to null)
			avatarId = nil
		} else {
			avatarId = req.AvatarId
		}
	}
	if req.DateOfBirth != nil {
		dateOfBirth = *req.DateOfBirth
	}
	if req.Email != nil {
		email = *req.Email
	}

	// Validate email uniqueness if changed
	if req.Email != nil && *req.Email != currentProfile.Email {
		emailExists, err := SelectEmailExists(email, userId)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}
		if emailExists {
			utils.BadRequest(w, "Email already exists.", "alert")
			return response, false
		}
	}

	// Validate nickname uniqueness if changed
	if req.Nickname != nil {
		if *req.Nickname != "" {
			if currentProfile.Nickname == nil || *req.Nickname != *currentProfile.Nickname {
				nicknameExists, err := SelectNicknameExists(*req.Nickname, userId)
				if err != nil {
					utils.BackendErrorTarget(err, context)
					utils.InternalServerError(w)
					return response, false
				}
				if nicknameExists {
					utils.BadRequest(w, "Nickname already exists.", "alert")
					return response, false
				}
			}
		}
	}

	// Handle account deletion if requested
	if req.DeleteAccount != nil && *req.DeleteAccount {
		utils.BackendErrorTarget(nil, "Account deletion requested for user: "+string(rune(userId)))
		err := DeleteUserAccount(userId)
		if err != nil {
			utils.BackendErrorTarget(err, context+" - DeleteUserAccount failed")
			utils.InternalServerError(w)
			return response, false
		}
		response.Message = "Account deleted successfully."
		return response, true
	}

	// Validate password change if requested
	if req.CurrentPassword != nil && req.Password != nil {
		// Both current and new password must be provided
		if *req.CurrentPassword == "" || *req.Password == "" {
			utils.BadRequest(w, "Both current password and new password are required.", "alert")
			return response, false
		}
		
		// Verify current password
		currentPasswordHash, err := SelectUserPasswordHash(userId)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}
		
		if !utils.CheckPasswordHash(*req.CurrentPassword, currentPasswordHash) {
			utils.BadRequest(w, "Current password is incorrect.", "alert")
			return response, false
		}
		
		// Hash new password
		newPasswordHash := *req.Password
		err = utils.GeneratePasswordHash(&newPasswordHash)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}
		
		// Update password
		err = UpdateUserPasswordInDB(userId, newPasswordHash)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}
	} else if req.CurrentPassword != nil || req.Password != nil {
		// If only one password field is provided, it's an error
		utils.BadRequest(w, "Both current password and new password must be provided to change password.", "alert")
		return response, false
	}

	// Update profile
	err = UpdateUserProfileInDB(userId, firstName, lastName, nickname, aboutMe, avatarId, dateOfBirth, email)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	response.Message = "Updated successful."
	return response, true
}

// UpdateUserPrivacy updates a user's privacy setting
func UpdateUserPrivacy(w http.ResponseWriter, userId int64, req *UpdatePrivacyRequestJson, context string) (UpdatePrivacyResponseJson, bool) {
	var response UpdatePrivacyResponseJson

	// Validate privacy value
	if req.Privacy != "public" && req.Privacy != "private" {
		utils.BadRequest(w, "Privacy must be 'public' or 'private'.", "alert")
		return response, false
	}

	// Update privacy
	err := UpdateUserPrivacyInDB(userId, req.Privacy)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.NotFoundError(w, "User profile not found.")
			return response, false
		}
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	response.Message = "Profile privacy updated successfully."
	response.Privacy = req.Privacy
	return response, true
}

// GetUserStats retrieves user statistics
func GetUserStats(w http.ResponseWriter, userId int64, context string) (UserStatsResponseJson, bool) {
	var response UserStatsResponseJson

	// Check if user exists
	_, err := SelectUserProfileById(userId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			utils.NotFoundError(w, "User profile not found.")
			return response, false
		}
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	// Get all stats
	postsCount, err := SelectPostsCount(userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	followersCount, err := SelectFollowersCount(userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	followingCount, err := SelectFollowingCount(userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	likesReceived, err := SelectLikesReceived(userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	commentsReceived, err := SelectCommentsReceived(userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	response.UserId = userId
	response.PostsCount = postsCount
	response.FollowersCount = followersCount
	response.FollowingCount = followingCount
	response.LikesReceived = likesReceived
	response.CommentsReceived = commentsReceived

	return response, true
}
