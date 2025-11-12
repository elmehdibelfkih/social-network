package auth

//select

const (
	SELECT_MEDIA_BY_MEDIA_ID         = `SELECT id, owner_id, path, mime, size, purpose, created_at FROM media WHERE id = ?`
	SELECT_PASSWORD_SESSION          = `SELECT id, password_hash FROM users WHERE email = ? or nickname = ? or id = ?`
	SELECT_SESSION_BY_SESSION        = `SELECT id, user_id, ip_address, device, created_at, session_expires_at FROM sessions WHERE session_token = ?`
	SELECT_USER_BY_ID                = `SELECT id, email, first_name, last_name, date_of_birth, nickname, about_me, avatar_id FROM users WHERE id = ?`
	SELECT_SESSION_BY_ID             = `SELECT id, user_id, session_token, ip_address, device, created_at FROM sessions WHERE user_id = ?`
	SELECT_SESSION_BY_ID_AND_SESSION = `SELECT id, user_id, session_token, ip_address, device, created_at FROM sessions WHERE user_id = ? AND session_token = ?`
	SELECT_REMEMBER_ME_BY_ID         = `SELECT id, user_id, remember_selector, remember_token, remember_expires_at FROM remember_me WHERE user_id = ?`
	SELECT_REMEMBER_ME_BY_SELECTOR   = `SELECT id, user_id, remember_selector, remember_token, remember_expires_at FROM remember_me WHERE remember_selector = ?`
)

//insert

const (
	INSERT_USER_ACCOUNT = `INSERT INTO users (id, email, password_hash, first_name, last_name, date_of_birth, nickname, about_me, avatar_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	INSERT_USER_SESSION      = `INSERT INTO sessions (id, user_id, session_token, ip_address, device, session_expires_at) VALUES (?, ?, ?, ?, ?, ?)`
	INSERT_REMEMBER_ME_TOKEN = `INSERT INTO remember_me (id, user_id, session_id, remember_selector, remember_token, remember_expires_at) VALUES (?, ?, ?, ?, ?, ?)`
)

//update

const (
	UPDATE_REMEMBER_ME_TOKEN = `UPDATE remember_me SET remember_expires_at = ? WHERE user_id = ?`
)

//delete

const (
	DELETE_USER_SESSION_BY_SESSION_TOKEN = `DELETE FROM sessions WHERE user_id = ? AND session_token = ?`
	DELETE_USER_SESSION_BY_SESSION_ID    = `DELETE FROM sessions WHERE user_id = ? AND id = ?`
)
