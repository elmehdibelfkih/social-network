package auth

//select

const (
	SELECT_SESSION_TOKEN_BY_SESSION = `SELECT COUNt(*) FROM sessions WHERE session_token = ?`
	SELECT_USER_BY_ID               = `SELECT id, email, first_name, last_name, date_of_birth, nickname, about_me, avatar_id
	FROM users WHERE id = ?`
)

//insert

const (
	INSERT_USER_ACCOUNT = `INSERT INTO users (id, email, password_hash, first_name, last_name, date_of_birth, nickname, about_me, avatar_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
)

//update

const ()

//delete

const ()
