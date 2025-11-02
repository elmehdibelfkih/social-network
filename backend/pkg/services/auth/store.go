package auth

import (
	"database/sql"
	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"
)

// read

func SelectAvatarMediaId(mediaId int64) (bool, error) {
	var m AvatarMediaSqlRow
	err := config.DB.QueryRow(SELECT_SESSION_BY_ID_AND_SESSION, mediaId).Scan(
		&m.MediaId,
		&m.OwnerId,
		&m.Path,
		&m.Mime,
		&m.Size,
		&m.Purpose,
		&m.CreatedAt,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_SESSION_BY_ID_AND_SESSION)
		return false, err
	}
	if m.OwnerId != 0 || m.Purpose != "avatar" {
		return false, nil
	}

	return true, nil
}

func SelectUserSessionsById(s *SessionsResponseJson, session string, userId int64) error {
	rows, err := config.DB.Query(SELECT_SESSION_BY_ID, userId)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_SESSION_BY_ID)
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var sessionItem SessionItemJson
		var session_token string
		rows.Scan(
			&sessionItem.SessionId,
			&sessionItem.UserId,
			&session_token,
			&sessionItem.IpAddress,
			&sessionItem.Device,
			&sessionItem.CreatedAt,
		)
		if session_token == session {
			sessionItem.Current = true
		}
		s.Sessions = append(s.Sessions, sessionItem)
	}
	return nil
}

func SelectUserSessionById(s *SessionResponseJson, session string, userId int64) error {
	err := config.DB.QueryRow(SELECT_SESSION_BY_ID_AND_SESSION, userId, session).Scan(
		&s.SessionId,
		&s.UserId,
		&s.SessionToken,
		&s.IpAddress,
		&s.Device,
		&s.CreatedAt,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_SESSION_BY_ID_AND_SESSION)
		return err
	}
	return nil
}

func SelectUserSessionCount(session string) (*SessionItemJson, error) {
	var s SessionItemJson
	err := config.DB.QueryRow(SELECT_SESSION_BY_SESSION, session).Scan(
		&s.SessionId,
		&s.UserId,
		&s.IpAddress,
		&s.Device,
		&s.CreatedAt,
		&s.ExpiresAt,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_SESSION_BY_SESSION)
		return &s, err
	}
	s.Current = true
	return &s, nil
}

func SelectUserPasswordHash(l LoginRequestJson) (int64, string, error) {
	var userId int64
	var password_hash string
	err := config.DB.QueryRow(SELECT_PASSWORD_SESSION, l.Identifier, l.Identifier, l.Identifier).Scan(&userId, &password_hash)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_PASSWORD_SESSION)
		return userId, password_hash, err
	}
	return userId, password_hash, nil

}

// write

func InsertUserAccount(u RegisterRequestJson) (RegisterResponseJson, error) {
	var userId = utils.GenerateID()
	var user RegisterResponseJson
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		nickname := utils.OptionalJsonFields(u.Nickname)
		aboutMe := utils.OptionalJsonFields(u.AboutMe)
		avatarId := utils.OptionalJsonFields(u.AvatarId)
		_, err := tx.Exec(
			INSERT_USER_ACCOUNT,
			userId,
			u.Email,
			u.Password,
			u.FirstName,
			u.LastName,
			u.DateOfBirth,
			nickname,
			aboutMe,
			avatarId,
		)

		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_USER_ACCOUNT)
		}

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

func InsertLoginUserSession(s *SessionResponseJson, l *LoginResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(
			INSERT_USER_SESSION,
			s.SessionId,
			s.UserId,
			s.SessionToken,
			s.IpAddress,
			s.Device,
		)

		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_USER_ACCOUNT)
		}
		err = tx.QueryRow(
			SELECT_USER_BY_ID,
			l.UserId,
		).Scan(
			&l.UserId,
			&l.Email,
			&l.FirstName,
			&l.LastName,
			&l.DateOfBirth,
			&l.Nickname,
			&l.AboutMe,
			&l.AvatarId,
		)

		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_USER_ACCOUNT)
		}
		return err
	})
}

func InsertRegisterUserSession(s *SessionResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(
			INSERT_USER_SESSION,
			s.SessionId,
			s.UserId,
			s.SessionToken,
			s.IpAddress,
			s.Device,
		)

		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_USER_ACCOUNT)
		}
		return err
	})
}

func DeleteUserSessionBySessionToken(session string, userId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(
			DELETE_USER_SESSION_BY_SESSION_TOKEN,
			userId,
			session,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, DELETE_USER_SESSION_BY_SESSION_TOKEN)
		}
		return err
	})
}

func DeleteUserSessionBySessionId(sessionId int64, userId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(
			DELETE_USER_SESSION_BY_SESSION_ID,
			userId,
			sessionId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, DELETE_USER_SESSION_BY_SESSION_ID)
		}
		return err
	})
}
