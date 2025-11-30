package follow

import (
	"database/sql"
	"errors"
	"strings"

	socket "social/pkg/app/sockets"
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

func followBack(followerId, followedId int64) (bool, error) {
	var exist bool
	err := config.DB.QueryRow(
		FOLLOW_BACK,
		followedId,
		followerId,
	).Scan(
		exist,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, FOLLOW_BACK)
	}
	return exist, err
}

func createConversation(followerId, followedId int64) error {
	var chatId int64
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		chatId = utils.GenerateID()
		_, err := tx.Exec(
			CREATE_CHAT_ROW,
			chatId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, CREATE_CHAT_ROW)
			return err
		}
		_, err = tx.Exec(
			ADD_CHAT_PARTICIPANT,
			chatId,
			followedId,
			0,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, ADD_CHAT_PARTICIPANT)
			return err
		}
		_, err = tx.Exec(
			ADD_CHAT_PARTICIPANT,
			chatId,
			followerId,
			0,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, ADD_CHAT_PARTICIPANT)
			return err
		}
		socket.WSManger.AddChatUser(chatId, followerId)
		socket.WSManger.AddChatUser(chatId, followedId)

		return nil
	})
}

func createChatId(followerId, followedId int64) error {
	public, err := isPublic(followedId)
	if err != nil {
		return err
	}
	if public {
		return createConversation(followerId, followedId)
	}
	if !public {
		follower, err := followBack(followerId, followedId)
		if err != nil {
			return err
		}
		if follower {
			return createConversation(followerId, followedId)
		}
	}
	return nil
}

func suspendConversation(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(
			SELECT_SHARED_CHATS,
			followerId,
			followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_SHARED_CHATS)
			return err
		}
		defer rows.Close()

		for rows.Next() {
			var chatId int64
			err = rows.Scan(&chatId)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_SHARED_CHATS)
				return err
			}
			_, err = tx.Exec(UPDATE_CHAT_STATUS, chatId)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_CHAT_STATUS)
				return err
			}
		}
		return nil
	})
}

func suspendChatId(followerId, followedId int64) error {
	follow1, err := followBack(followerId, followedId)
	if err != nil {
		return err
	}
	follow2, err := followBack(followedId, followerId)
	if err != nil {
		return err
	}
	if !follow1 && !follow2 {
		return suspendConversation(followerId, followedId)
	}
	if !follow1 {
		public, err := isPublic(followedId)
		if err != nil {
			return err
		}
		if !public {
			return suspendConversation(followerId, followedId)
		}
	}
	if !follow2 {
		public, err := isPublic(followerId)
		if err != nil {
			return err
		}
		if !public {
			return suspendConversation(followerId, followedId)
		}
	}
	return nil
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
			followedAt string
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
