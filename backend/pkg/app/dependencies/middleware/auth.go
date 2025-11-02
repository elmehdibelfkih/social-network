package middleware

import (
	"context"
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

		sessionItem, err := auth.SelectUserSessionCount(sessionValue)
		if err != nil || sessionItem == nil {
			utils.Unauthorized(w, config.ERROR_INVALID_SESSION)
			return
		}

		if sessionItem.IsExpired() {
			utils.Unauthorized(w, config.ERROR_INVALID_SESSION)
			return
		}

		//todo:remeber-me-token logic

		// user authenticated
		ctx := context.WithValue(r.Context(), config.USER_ID_KEY, sessionItem.UserId)
		next(w, r.WithContext(ctx))
	}
}
