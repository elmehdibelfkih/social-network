package auth

import (
	"database/sql"
	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"
)

// read

func SelectUserSessionCount(session string) (bool, error) {
	var count int
	err := config.DB.QueryRow(SELECT_SESSION_TOKEN_BY_SESSION, session).Scan(&count)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_SESSION_TOKEN_BY_SESSION)
		return false, err
	}
	return count > 0, nil
}

func SelectUserAccount()

// write

func InsertUserAccount(u RegisterRequestJson) (RegisterResponseJson, error) {
	var userId = utils.GenerateID()
	var user RegisterResponseJson
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(
			INSERT_USER_ACCOUNT,
			userId,
			u.Email,
			u.Password,
			u.FirstName,
			u.LastName,
			u.DateOfBirth,
			u.Nickname,
			u.AboutMe,
			u.AvatarId,
		)
		err = tx.QueryRow(
			SELECT_USER_BY_ID,
			userId,
		).Scan(
			&user.UserId,
			&user.Email,
			&user.FirstName,
			&user.LastName,
			&user.DateOfBirth,
			&user.Nickname,
			&user.AboutMe,
			&user.AvatarId,
		)

		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_USER_ACCOUNT)
		}
		return err
	})
	return user, err
}
