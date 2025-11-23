package socket

import (
	"database/sql"

	"social/pkg/db/database"
	"social/pkg/utils"
)

// read

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
