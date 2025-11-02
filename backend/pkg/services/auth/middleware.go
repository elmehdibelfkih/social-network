package auth

import (
	"net/http"
	"social/pkg/config"
	"social/pkg/utils"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionValue, err := checkSession(r)
		if err != nil {
			utils.Unauthorized(w, config.ERROR_EMPTY_SESSION)
			return
		}

		hasSession, err := SelectUserSessionCount(sessionValue)
		if err != nil || !hasSession {
			utils.Unauthorized(w, config.ERROR_INVALID_SESSION)
			return
		}

		// user authenticated
		next(w, r)
	}
}

func checkSession(r *http.Request) (string, error) {
	session, err := r.Cookie("session_token")
	if err != nil {
		utils.BackendErrorTarget(err, "auth")
		return "", nil
	}
	return session.Value, err
}
