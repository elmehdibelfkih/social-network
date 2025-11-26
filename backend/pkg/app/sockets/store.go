package socket

import (
	"database/sql"

	"social/pkg/db/database"
	"social/pkg/utils"
)

// read
func SelectUserData(userId int64) (UserData, error) {
	var user UserData
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(
			SELECT_USER_BY_ID,
			userId,
		).Scan(
			&user.FirstName,
			&user.LastName,
			&user.Nickname,
			&user.DateOfBirth,
			&user.AvatarId,
			&user.AboutMe,
			&user.Privacy,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_USER_BY_ID)
			return err
		}
		return err
	})
	return user, err
}

func SelectChatParticipants(chatId int64) (map[int64]struct{}, error) {
	var userIds map[int64]struct{}
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(SELECT_CHAT_USERS, chatId)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_CHAT_USERS)
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id int64
			err = rows.Scan(&id)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_CHAT_USERS)
				return err
			}
			userIds[id] = struct{}{}
		}
		return nil
	})
	return userIds, err
}

func SelectUserFollowers(userId int64) (*OnlineStatus, error) {
	var users *OnlineStatus
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(SELECT_FOLLOWERS_BY_USER_ID, userId)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_FOLLOWERS_BY_USER_ID)
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var u User
			err = rows.Scan(
				&u.UserId,
				&u.Nickname,
				&u.Email,
				&u.FirstName,
				&u.LastName,
				&u.DateOfBirth,
				&u.AvatarId,
				&u.AboutMe,
				&u.Privacy,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_FOLLOWERS_BY_USER_ID)
				return err
			}
			users.OnlineUsers = append(users.OnlineUsers, u)
		}
		return nil
	})
	return users, err
}
