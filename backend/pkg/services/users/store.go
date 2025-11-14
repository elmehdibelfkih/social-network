package users

import (
	"database/sql"
	"errors"
	"social/pkg/config"
	"social/pkg/utils"
)

// Read operations

func SelectUserIdBySession(session string) (int64, error) {
	var userId int64
	err := config.DB.QueryRow(SELECT_USERID_BY_SESSION, session).Scan(&userId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return userId, nil
		}
		utils.SQLiteErrorTarget(err, SELECT_USERID_BY_SESSION)
		return userId, err
	}
	return userId, nil
}

// SelectUserProfileById returns the full user row required to build a profile response.
func SelectUserProfileById(userId int64) (*UserProfile, error) {
	var profile UserProfile
	err := config.DB.QueryRow(SELECT_USER_PROFILE_BY_ID, userId).Scan(
		&profile.Id,
		&profile.Email,
		&profile.Nickname,
		&profile.FirstName,
		&profile.LastName,
		&profile.DateOfBirth,
		&profile.AvatarId,
		&profile.AboutMe,
		&profile.Privacy,
		&profile.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		utils.SQLiteErrorTarget(err, SELECT_USER_PROFILE_BY_ID)
		return nil, err
	}
	return &profile, nil
}

// SelectUserBasicById returns (id, privacy) for quick existence and privacy checks.
func SelectUserBasicById(userId int64) (int64, string, error) {
	var id int64
	var privacy string
	err := config.DB.QueryRow(SELECT_USER_BASIC_BY_ID, userId).Scan(&id, &privacy)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, "", sql.ErrNoRows
		}
		utils.SQLiteErrorTarget(err, SELECT_USER_BASIC_BY_ID)
		return 0, "", err
	}
	return id, privacy, nil
}

// SelectFollowStatus returns whether followerId is following followingId.
// func SelectFollowStatus(followerId, followed int64) (bool, error) {
// 	var count int64
// 	err := config.DB.QueryRow(SELECT_FOLLOW_STATUS, followerId, followed).Scan(&count)
// 	if err != nil {
// 		utils.SQLiteErrorTarget(err, SELECT_FOLLOW_STATUS)
// 		return false, err
// 	}
// 	return count > 0, nil
// }

func SelectFollowStatusType(followerId, followed int64) (*FollowStatusType, error) {
	var followType FollowStatusType
	err := config.DB.QueryRow(SELECT_FOLLOW_STATUS_TYPE, followerId, followed).Scan(&followType.Status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		utils.SQLiteErrorTarget(err, SELECT_FOLLOW_STATUS_TYPE)
		return nil, err
	}
	return &followType, nil
}

// func SelectFollowChatId(followerId, followed int64) (*FollowChatId, error) {
// 	var chatId FollowChatId
// 	err := config.DB.QueryRow(SELECT_CHAT_ID, followerId, followed).Scan(&FollowChatId.chatId.Status)
// 	if err != nil {
// 		if errors.Is(err, sql.ErrNoRows) {
// 			return nil, sql.ErrNoRows
// 		}
// 		utils.SQLiteErrorTarget(err, SELECT_FOLLOW_STATUS_TYPE)
// 		return nil, err
// 	}
// 	return &chatId, nil
// }

// SelectUserPrivacy returns the privacy value for a user.
func SelectUserPrivacy(userId int64) (string, error) {
	var privacy string
	err := config.DB.QueryRow(SELECT_USER_PRIVACY, userId).Scan(&privacy)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", sql.ErrNoRows
		}
		utils.SQLiteErrorTarget(err, SELECT_USER_PRIVACY)
		return "", err
	}
	return privacy, nil
}

// SelectPostsCount returns the number of non-group posts authored by a user.
func SelectPostsCount(userId int64) (int64, error) {
	var count int64
	err := config.DB.QueryRow(SELECT_POSTS_COUNT, userId).Scan(&count)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_POSTS_COUNT)
		return 0, err
	}
	return count, nil
}

// SelectFollowersCount returns how many users follow the given user.
func SelectFollowersCount(userId int64) (int64, error) {
	var count int64
	err := config.DB.QueryRow(SELECT_FOLLOWERS_COUNT, userId, "accepted").Scan(&count)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_FOLLOWERS_COUNT)
		return 0, err
	}
	return count, nil
}

// SelectFollowingCount returns how many users the given user follows.
func SelectFollowingCount(userId int64) (int64, error) {
	var count int64
	err := config.DB.QueryRow(SELECT_FOLLOWING_COUNT, userId, "accepted").Scan(&count)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_FOLLOWING_COUNT)
		return 0, err
	}
	return count, nil
}

// SelectLikesReceived returns total reactions on the user's posts.
func SelectLikesReceived(userId int64) (int64, error) {
	var count int64
	err := config.DB.QueryRow(SELECT_LIKES_RECEIVED, userId).Scan(&count)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_LIKES_RECEIVED)
		return 0, err
	}
	return count, nil
}

// SelectCommentsReceived returns total comments on the user's posts from others.
func SelectCommentsReceived(userId int64) (int64, error) {
	var count int64
	err := config.DB.QueryRow(SELECT_COMMENTS_RECEIVED, userId, userId).Scan(&count)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_COMMENTS_RECEIVED)
		return 0, err
	}
	return count, nil
}

// SelectEmailExists checks if an email is already used by someone else.
func SelectEmailExists(email string, excludeUserId int64) (bool, error) {
	var count int64
	err := config.DB.QueryRow(SELECT_EMAIL_EXISTS, email, excludeUserId).Scan(&count)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_EMAIL_EXISTS)
		return false, err
	}
	return count > 0, nil
}

// SelectNicknameExists checks if a nickname is already used by someone else.
func SelectNicknameExists(nickname string, excludeUserId int64) (bool, error) {
	var count int64
	err := config.DB.QueryRow(SELECT_NICKNAME_EXISTS, nickname, excludeUserId).Scan(&count)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_NICKNAME_EXISTS)
		return false, err
	}
	return count > 0, nil
}

// Write operations

// UpdateUserProfileInDB persists profile changes.
func UpdateUserProfileInDB(userId int64, firstName, lastName string, nickname, aboutMe *string, avatarId *int64, dateOfBirth, email string) error {
	result, err := config.DB.Exec(UPDATE_USER_PROFILE,
		firstName,
		lastName,
		nickname,
		aboutMe,
		avatarId,
		dateOfBirth,
		email,
		userId,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, UPDATE_USER_PROFILE)
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		utils.SQLiteErrorTarget(err, UPDATE_USER_PROFILE)
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// UpdateUserPrivacyInDB updates a user's privacy value.
func UpdateUserPrivacyInDB(userId int64, privacy string) error {
	result, err := config.DB.Exec(UPDATE_USER_PRIVACY, privacy, userId)
	if err != nil {
		utils.SQLiteErrorTarget(err, UPDATE_USER_PRIVACY)
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		utils.SQLiteErrorTarget(err, UPDATE_USER_PRIVACY)
		return err
	}
	if rowsAffected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
