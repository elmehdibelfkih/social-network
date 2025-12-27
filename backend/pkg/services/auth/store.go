package auth

import (
	"database/sql"
	"fmt"
	"net/url"
	"strings"
	"time"

	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"
)

// read

func SelectAvatarMediaId(mediaId int64) (bool, error) {
	var m AvatarMediaSqlRow
	err := config.DB.QueryRow(SELECT_MEDIA_BY_MEDIA_ID, mediaId).Scan(
		&m.MediaId,
		&m.OwnerId,
		&m.Path,
		&m.Mime,
		&m.Size,
		&m.Purpose,
		&m.CreatedAt,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_MEDIA_BY_MEDIA_ID)
		return false, err
	}
	if (m.OwnerId.Valid && m.OwnerId.Int64 != -1) || m.Purpose != "avatar" {
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
		err = rows.Scan(
			&sessionItem.SessionId,
			&sessionItem.UserId,
			&session_token,
			&sessionItem.IpAddress,
			&sessionItem.Device,
			&sessionItem.CreatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_SESSION_BY_ID)
			return err
		}
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

func SelectUserSession(session string) (*SessionItemJson, error) {
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
		if err == sql.ErrNoRows {
			return nil, nil
		}
		utils.SQLiteErrorTarget(err, SELECT_SESSION_BY_SESSION)
		return nil, err
	}
	s.Current = true
	return &s, nil
}

func SelectUserRememberMe(session string) (*RememberMeSqlRow, error) {
	var r RememberMeSqlRow
	decoded, err := url.QueryUnescape(session)
	if err != nil {
		return nil, err
	}

	parts := strings.Split(decoded, ":")
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid remember-me cookie format")
	}

	selector := parts[0]

	err = config.DB.QueryRow(
		SELECT_REMEMBER_ME_BY_SELECTOR,
		selector,
	).Scan(
		&r.RememberId,
		&r.UserId,
		&r.Selector,
		&r.Token,
		&r.ExpiresAt,
	)

	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_REMEMBER_ME_BY_SELECTOR)
		return &r, err
	}

	return &r, nil
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

// insert
func InsertUserAccount(u RegisterRequestJson) (RegisterResponseJson, error) {
	userId := utils.GenerateID()
	var user RegisterResponseJson
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		nickname := utils.TrimAny(utils.OptionalJsonFields(u.Nickname))
		aboutMe := utils.TrimAny(utils.OptionalJsonFields(u.AboutMe))
		avatarId := utils.TrimAny(utils.OptionalJsonFields(u.AvatarId))
		_, err := tx.Exec(
			INSERT_USER_ACCOUNT,
			userId,
			strings.TrimSpace(u.Email),
			u.Password,
			strings.TrimSpace(u.FirstName),
			strings.TrimSpace(u.LastName),
			u.DateOfBirth,
			nickname,
			aboutMe,
			avatarId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_USER_ACCOUNT)
			return err
		}
		if avatarId != nil {
			_, err = tx.Exec(
				UPDATE_AVATAR_OWNER,
				userId,
				avatarId,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_AVATAR_OWNER)
				return err
			}
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
			s.ExpiresAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_USER_ACCOUNT)
			return err
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
			s.ExpiresAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_USER_ACCOUNT)
		}
		return err
	})
}

// update
func UpdateRememberMeToken(sessionId int64, remember *RememberMeSqlRow, userId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(SELECT_REMEMBER_ME_BY_ID, userId).Scan(
			&remember.RememberId,
			&remember.UserId,
			&remember.Selector,
			&remember.Token,
			&remember.ExpiresAt,
		)

		if err != nil && err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, SELECT_REMEMBER_ME_BY_ID)
			return err
		}

		// Always update expiry timestamp
		remember.ExpiresAt = time.Now().UTC().Add(90 * 24 * time.Hour).Format(time.RFC3339)

		if err == sql.ErrNoRows {
			remember.RememberId = utils.GenerateID()
			remember.UserId = userId
			remember.SessionId = sessionId
			remember.Selector = utils.GenerateSessionToken(16)
			remember.Token = utils.GenerateSessionToken(256)

			if _, err := tx.Exec(
				INSERT_REMEMBER_ME_TOKEN,
				remember.RememberId,
				remember.UserId,
				remember.SessionId,
				remember.Selector,
				remember.Token,
				remember.ExpiresAt,
			); err != nil {
				utils.SQLiteErrorTarget(err, INSERT_REMEMBER_ME_TOKEN)
				return err
			}
		} else {
			_, err = tx.Exec(
				UPDATE_REMEMBER_ME_TOKEN,
				remember.ExpiresAt,
				userId,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_REMEMBER_ME_TOKEN)
				return err
			}
		}
		return nil
	})
}

// delete
func DeleteUserSessionBySessionToken(session string, userId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(
			DELETE_USER_SESSION_BY_SESSION_TOKEN,
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
