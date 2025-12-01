package follow

import (
	"database/sql"
	"errors"
	"strings"

	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"

	"github.com/mattn/go-sqlite3"
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

		if sqliteErr, ok := err.(sqlite3.Error); ok && sqliteErr.Code == sqlite3.ErrError {
			if strings.Contains(sqliteErr.Error(), "no such column") {
				return "", nil
			}
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
			return false, nil
		}
		utils.SQLiteErrorTarget(err, IS_USER_PROFILE_PUBLIC_QUERY)
		return false, err
	}
	return isPublic, nil
}

func followUser(followerId, followedId int64) error {
	// todo: check if already ixist a notification
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(FOLLOW_REQUEST_QUERY,
			followerId, followedId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, FOLLOW_REQUEST_QUERY)
			return err
		}

		status, err := selectFollowStatus(followerId, followedId)
		if err != nil {
			return err
		}

		n := followNotification(followerId, followedId, status)
		_, err = tx.Exec(INSERT_NOTIFICATION,
			n.id, n.UserId, n.Type, n.ReferenceType, n.ReferenceId, n.Content,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_NOTIFICATION)
			return err
		}

		isPublic, err := isPublic(followedId)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_NOTIFICATION)
			return err
		}

		if !isPublic {
			return nil
		}

		counter := followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followedId, database.FOLLOWERS_ENTITY_NAME, "increment")

		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.USER_ENTITY_TYPE)
			return err
		}
		return nil
	})
}

func unfollowUser(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(UNFOLLOW_REQUEST_QUERY,
			followerId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}

		counter := followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followedId, database.FOLLOWERS_ENTITY_NAME, "decrement")

		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}

		return nil
	})
}
func GetFollowersByUserID(userID int64) ([]map[string]any, error) {
	rows, err := config.DB.Query(GET_FOLLOWERS_QUERY, userID, userID, userID)
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
			followedAt sql.NullString
			status     sql.NullString
			chatId     sql.NullInt64
		)

		if err := rows.Scan(
			&userId,
			&nickname,
			&firstName,
			&lastName,
			&avatarId,
			&followedAt,
			&status,
			&chatId,
		); err != nil {
			utils.SQLiteErrorTarget(err, GET_FOLLOWERS_QUERY)
			return nil, err
		}

		var avatarVal any = nil
		if avatarId.Valid {
			avatarVal = avatarId.Int64
		}

		var nickVal any = nil
		if nickname.Valid {
			nickVal = nickname.String
		}

		var firstVal any = nil
		if firstName.Valid {
			firstVal = firstName.String
		}

		var lastVal any = nil
		if lastName.Valid {
			lastVal = lastName.String
		}

		var followedAtVal any = nil
		if followedAt.Valid {
			followedAtVal = followedAt.String
		}

		var statusVal any = nil
		if status.Valid {
			statusVal = status.String
		}

		var chatVal any = nil
		if chatId.Valid {
			chatVal = chatId.Int64
		}

		follower := map[string]any{
			"userId":     userId,
			"nickname":   nickVal,
			"firstName":  firstVal,
			"lastName":   lastVal,
			"avatarId":   avatarVal,
			"followedAt": followedAtVal,
			"status":     statusVal,
			"chatId":     chatVal,
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
			firstName  string
			lastName   string
			avatarId   sql.NullInt64
			followedAt string
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
			"firstName":  firstName,
			"lastName":   lastName,
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

func GetFollowRequestByUserID(userID int64) ([]map[string]any, error) {
	rows, err := config.DB.Query(GET_FOLLOW_REQUEST_QUERY, userID)
	if err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOW_REQUEST_QUERY)
		return nil, err
	}
	defer rows.Close()

	var followers []map[string]any

	for rows.Next() {
		var (
			userId     int64
			nickname   sql.NullString
			firstName  string
			lastName   string
			avatarId   sql.NullInt64
			followedAt string
			status     string
		)

		err = rows.Scan(&userId, &nickname, &firstName, &lastName, &avatarId, &followedAt, &status)
		if err != nil {
			utils.SQLiteErrorTarget(err, GET_FOLLOW_REQUEST_QUERY)
			return nil, err
		}

		follower := map[string]any{
			"userId":     userId,
			"nickname":   nickname.String,
			"firstName":  firstName,
			"lastName":   lastName,
			"avatarId":   avatarId.Int64,
			"followedAt": followedAt,
			"status":     status,
		}

		followers = append(followers, follower)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOW_REQUEST_QUERY)
		return nil, err
	}

	return followers, nil
}

func acceptFollowRequest(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(ACCEPT_FOLLOW_REQUEST_QUERY,
			followerId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, ACCEPT_FOLLOW_REQUEST_QUERY)
			return err
		}

		counter := followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followedId, database.FOLLOWERS_ENTITY_NAME, "increment")

		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}

		return nil
	})
}

func declineFollowRequest(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(DECLINE_FOLLOW_REQUEST_QUERY,
			followerId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, DECLINE_FOLLOW_REQUEST_QUERY)
			return err
		}
		return nil
	})
}
