package auth

//select

const (
	SELECT_PASSWORD_SESSION          = `SELECT id, password_hash FROM users WHERE email = ? or nickname = ? or id = ?`
	SELECT_SESSION_TOKEN_BY_SESSION  = `SELECT COUNt(*) FROM sessions WHERE session_token = ?`
	SELECT_USER_BY_ID                = `SELECT id, email, first_name, last_name, date_of_birth, nickname, about_me, avatar_id FROM users WHERE id = ?`
	SELECT_SESSION_BY_ID             = `SELECT id, user_id, session_token, ip_adress, device, created_at FROM sessions WHERE user_id = ?`
	SELECT_SESSION_BY_ID_AND_SESSION = `SELECT id, user_id, session_token, ip_adress, device, created_at FROM sessions WHERE user_id = ? AND session_token = ?`
)

//insert

const (
	INSERT_USER_ACCOUNT = `INSERT INTO users (id, email, password_hash, first_name, last_name, date_of_birth, nickname, about_me, avatar_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	INSERT_USER_SESSION = `INSERT INTO sessions (id, user_id, session_token, ip_address, device) VALUES (?, ?, ?, ?, ?)
`
)

//update

const ()

//delete

const (
	DELETE_USER_SESSION = `DELETE FROM session WHERE user_id = ? AND session_token = ?`
)
