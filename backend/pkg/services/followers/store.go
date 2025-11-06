package follow

import (
	"database/sql"
	"errors"
	"social/pkg/config"
	"social/pkg/utils"
	"time"
)

func selectFollowStatus(followerId, followedId int64) (string, error) {
	var status string

	err := config.DB.QueryRow(
		SELECT_FOLLOW_STATUS_QUERY,
		followerId, followedId,
	).Scan(&status)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil
		}
		utils.SQLiteErrorTarget(err, SELECT_FOLLOW_STATUS_QUERY)
		return "", err
	}

	return status, nil
}

func userExists(userId int64) (bool, error) {
	var exists bool
	err := config.DB.QueryRow(
		USER_EXISTS_QUERY,
		userId,
	).Scan(&exists)
	if err != nil {
		utils.SQLiteErrorTarget(err, USER_EXISTS_QUERY)
		return false, err
	}
	return exists, nil
}

func isPublic(userId int64) (bool, error) {

	var isPublic bool
	err := config.DB.QueryRow(
		IS_USER_PROFILE_PUBLIC_QUERY,
		userId,
	).Scan(&isPublic)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil // user not found → treat as private
		}
		utils.SQLiteErrorTarget(err, IS_USER_PROFILE_PUBLIC_QUERY)
		return false, err
	}
	return isPublic, nil
}

func GetFollowersByUserID(userID int64) ([]map[string]any, error) {
	rows, err := config.DB.Query(GET_FOLLOWERS_QUERY, userID)
	if err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOWERS_QUERY)
		return nil, err
	}
	defer rows.Close()

	var followers []map[string]any

	for rows.Next() {
		var (
			userId     int64
			nickname   sql.NullString
			firstName  sql.NullString
			lastName   sql.NullString
			avatarId   sql.NullInt64
			followedAt time.Time
			status     string
		)

		err = rows.Scan(&userId, &nickname, &firstName, &lastName, &avatarId, &followedAt, &status)
		if err != nil {
			utils.SQLiteErrorTarget(err, GET_FOLLOWERS_QUERY)
			return nil, err
		}

		follower := map[string]any{
			"userId":     userId,
			"nickname":   nickname.String,
			"firstName":  firstName.String,
			"lastName":   lastName.String,
			"avatarId":   avatarId.Int64,
			"followedAt": followedAt,
			"status":     status,
		}

		followers = append(followers, follower)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOWERS_QUERY)
		return nil, err
	}

	return followers, nil
}

func GetFolloweesByUserID(userID int64) ([]map[string]any, error) {
	rows, err := config.DB.Query(GET_FOLLOWEES_QUERY, userID)
	if err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOWEES_QUERY)
		return nil, err
	}
	defer rows.Close()

	var followers []map[string]any

	for rows.Next() {
		var (
			userId     int64
			nickname   sql.NullString
			firstName  sql.NullString
			lastName   sql.NullString
			avatarId   sql.NullInt64
			followedAt time.Time
			status     string
		)

		err = rows.Scan(&userId, &nickname, &firstName, &lastName, &avatarId, &followedAt, &status)
		if err != nil {
			utils.SQLiteErrorTarget(err, GET_FOLLOWEES_QUERY)
			return nil, err
		}

		follower := map[string]any{
			"userId":     userId,
			"nickname":   nickname.String,
			"firstName":  firstName.String,
			"lastName":   lastName.String,
			"avatarId":   avatarId.Int64,
			"followedAt": followedAt,
			"status":     status,
		}

		followers = append(followers, follower)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOWEES_QUERY)
		return nil, err
	}

	return followers, nil
}
