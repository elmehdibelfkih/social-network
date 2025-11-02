package users

import (
	"database/sql"
	"errors"
	"social/pkg/config"
	"social/pkg/utils"
)

// read

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

// write
