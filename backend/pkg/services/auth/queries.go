package auth

//select

const (
	SELECT_MEDIA_BY_MEDIA_ID         = `SELECT id, owner_id, path, mime, size, purpose, created_at FROM media WHERE id = ?`
	SELECT_PASSWORD_SESSION          = `SELECT id, password_hash FROM users WHERE email = ? or nickname = ? or id = ?`
	SELECT_SESSION_BY_SESSION        = `SELECT id, user_id, ip_address, device, created_at, session_expires_at FROM sessions`
	SELECT_USER_BY_ID                = `SELECT id, email, first_name, last_name, date_of_birth, nickname, about_me, avatar_media_id FROM users WHERE id = ?`
	SELECT_SESSION_BY_ID             = `SELECT id, user_id, session_token, ip_address, device, created_at FROM sessions WHERE user_id = ?`
	SELECT_SESSION_BY_ID_AND_SESSION = `SELECT id, user_id, session_token, ip_address, device, created_at FROM sessions WHERE user_id = ? AND session_token = ?`
)

//insert

const (
	INSERT_USER_ACCOUNT = `INSERT INTO users (id, email, password_hash, first_name, last_name, date_of_birth, nickname, about_me, avatar_media_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	INSERT_USER_SESSION = `INSERT INTO sessions (id, user_id, session_token, ip_address, device, session_expires_at) VALUES (?, ?, ?, ?, ?, ?)`
)

//update

const ()

//delete

const (
	DELETE_USER_SESSION_BY_SESSION_TOKEN = `DELETE FROM sessions WHERE user_id = ? AND session_token = ?`
	DELETE_USER_SESSION_BY_SESSION_ID    = `DELETE FROM sessions WHERE user_id = ? AND session_id = ?`
)
