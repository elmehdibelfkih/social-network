package users

import (
	"database/sql"
	"errors"
	"net/http"
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

	// Privacy check: if private, only owner or followers can view
	if profile.Privacy == "private" {
		// Owner can always view their own profile
		if viewerUserId == 0 || viewerUserId != profileUserId {
			// Check if viewer is a follower
			isFollower, err := SelectFollowStatus(viewerUserId, profileUserId)
			if err != nil {
				utils.BackendErrorTarget(err, context)
				utils.InternalServerError(w)
				return response, false
			}
			if !isFollower {
				utils.Unauthorized(w, "This profile is private. You must follow this user to view their profile.")
				return response, false
			}
		}
	}

	// Get follow status (is follow || unfollow )
	var followStatus string = "follow"
	if viewerUserId > 0 && viewerUserId != profileUserId {
		isFollowing, err := SelectFollowStatus(viewerUserId, profileUserId)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}
		if isFollowing {
			followStatus = "unfollow"
		}
	}

	// Get stats
	postsCount, err := SelectPostsCount(profileUserId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

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

	// Build response
	response.UserId = profile.Id
	if (viewerUserId == profileUserId) { response.Status = nil }else{ response.Status = &followStatus  }
	response.Nickname = profile.Nickname
	response.FirstName = profile.FirstName
	response.LastName = profile.LastName
	response.AvatarId = profile.AvatarId
	response.AboutMe = profile.AboutMe
	response.DateOfBirth = profile.DateOfBirth
	response.Privacy = profile.Privacy
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
		nickname = req.Nickname
	}
	if req.AboutMe != nil {
		aboutMe = req.AboutMe
	}
	if req.AvatarId != nil {
		avatarId = req.AvatarId
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
