package middleware

import (
	"net/http"
	"social/pkg/config"
	"social/pkg/services/auth"
	"social/pkg/utils"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sessionValue, err := utils.CheckSession(r)
		if err != nil {
			utils.Unauthorized(w, config.ERROR_EMPTY_SESSION)
			return
		}

		hasSession, err := auth.SelectUserSessionCount(sessionValue)
		if err != nil || !hasSession {
			utils.Unauthorized(w, config.ERROR_INVALID_SESSION)
			return
		}

		// user authenticated
		next(w, r)
	}
}
