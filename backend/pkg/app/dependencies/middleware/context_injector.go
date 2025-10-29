package middleware

import (
	"context"
	"net/http"
	"social/pkg/config"
	"social/pkg/services/users"
	"social/pkg/utils"
	// "social/pkg/services/users"
)

func UserContext(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, err := checkSession(r)
		if err != nil {
			next(w, r)
			return
		}
		ctx := context.WithValue(r.Context(), config.USER_ID_KEY, userId)
		next(w, r.WithContext(ctx))
	}
}

func checkSession(r *http.Request) (*int64, error) {
	session, err := r.Cookie("session_token")
	if err != nil {
		utils.BackendErrorTarget(err, "UserContext")
		return nil, nil
	}
	userId, err := users.SelectUserIdBySession(session.Value)
	return userId, err
}
