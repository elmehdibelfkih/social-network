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
func UpdateUserProfile(w http.ResponseWriter, userId int64, req *UpdateProfileRequestJson, context string) (UpdateProfileResponseJson, bool) {
	var response UpdateProfileResponseJson

	// Get current user profile
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

	// FirstName
	if req.FirstName != nil {
		ok, clean := utils.FirstNameLastName(strings.TrimSpace(*req.FirstName))
		if !ok {
			utils.BadRequest(w, *req.FirstName, "alert")
			return response, false
		}
		firstName = clean
	}

	// LastName
	if req.LastName != nil {
		ok, clean := utils.FirstNameLastName(strings.TrimSpace(*req.LastName))
		if !ok {
			utils.BadRequest(w, *req.LastName, "alert")
			return response, false
		}
		lastName = clean
	}

	// Nickname
	if req.Nickname != nil {
		cleanNick := strings.TrimSpace(*req.Nickname)
		if cleanNick == "" {
			nickname = nil
		} else {
			ok, clean := utils.FirstNameLastName(cleanNick)
			if !ok {
				utils.BadRequest(w, cleanNick, "alert")
				return response, false
			}
			// Check uniqueness only if changed
			if currentProfile.Nickname == nil || clean != *currentProfile.Nickname {
				nicknameExists, err := SelectNicknameExists(clean, userId)
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
			nickname = &clean
		}
	}

	// AboutMe
	if req.AboutMe != nil {
		clean := strings.TrimSpace(*req.AboutMe)
		if clean != "" {
			if ok, _ := utils.TextContentValidationEscape(&clean, 5, 2048); !ok {
				return response, false
			}
			aboutMe = &clean
		} else {
			aboutMe = nil
		}
	}

	// Avatar
	if req.AvatarId != nil {
		if *req.AvatarId == -1 {
			avatarId = nil
		} else {
			avatarId = req.AvatarId
		}
	}

	// DateOfBirth
	if req.DateOfBirth != nil {
		if !utils.DateValidation(*req.DateOfBirth) {
			utils.BadRequest(w, "Invalid date format.", "alert")
			return response, false
		}
		dateOfBirth = *req.DateOfBirth
	}

	// Email
	if req.Email != nil {
		cleanEmail := strings.TrimSpace(*req.Email)
		if ok, _ := utils.EmailValidation(cleanEmail); !ok {
			utils.BadRequest(w, cleanEmail, "alert")
			return response, false
		}
		// Check uniqueness only if changed
		if cleanEmail != currentProfile.Email {
			emailExists, err := SelectEmailExists(cleanEmail, userId)
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
		email = cleanEmail
	}

	// Account deletion
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

	// Password change
	if req.CurrentPassword != nil && req.Password != nil {
		if *req.CurrentPassword == "" || *req.Password == "" {
			utils.BadRequest(w, "Both current and new password are required.", "alert")
			return response, false
		}

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

		newPasswordHash := *req.Password
		err = utils.GeneratePasswordHash(&newPasswordHash)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}

		err = UpdateUserPasswordInDB(userId, newPasswordHash)
		if err != nil {
			utils.BackendErrorTarget(err, context)
			utils.InternalServerError(w)
			return response, false
		}
	} else if req.CurrentPassword != nil || req.Password != nil {
		utils.BadRequest(w, "Both current and new password must be provided to change password.", "alert")
		return response, false
	}

	// Update profile in DB
	err = UpdateUserProfileInDB(userId, firstName, lastName, nickname, aboutMe, avatarId, dateOfBirth, email)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	response.Message = "Updated successfully."
	return response, true
}
