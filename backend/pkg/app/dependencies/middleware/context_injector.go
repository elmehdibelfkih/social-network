package middleware

import (
	"net/http"
	"social/pkg/services/users"
)

func UserContext(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		checkSession(r)
	}
}

func checkSession(r *http.Request) (*users.UserRequestJson, error) {
	session, err := r.Cookie("session_token") //todo: config
	if err != nil {
		return nil, err
	}

	
	return nil, nil
}
