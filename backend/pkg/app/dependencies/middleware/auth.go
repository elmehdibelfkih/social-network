package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"social/pkg/config"
	"social/pkg/services/auth"
	"social/pkg/utils"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r)
		userId, err := authenticateRequest(w, r)
		if err != nil {
			utils.Unauthorized(w, err.Error())
			return
		}
		// inject user ID into context
		ctx := context.WithValue(r.Context(), config.USER_ID_KEY, userId)
		next(w, r.WithContext(ctx))
	}
}

func authenticateRequest(w http.ResponseWriter, r *http.Request) (int64, error) {
	userId := trySession(r)
	if userId != 0 {
		return userId, nil
	}

	userId, err := tryRememberMe(w, r)
	if err != nil || userId == 0 {
		return 0, err
	}

	return userId, nil
}

func trySession(r *http.Request) int64 {
	sessionValue, err := utils.CheckSession("session_token", r)
	if err != nil {
		return 0
	}
	sessionItem, err := auth.SelectUserSession(sessionValue)
	if err != nil || sessionItem == nil || sessionItem.IsExpired() {
		return 0
	}
	fmt.Println(sessionItem)

	return sessionItem.UserId
}

func tryRememberMe(w http.ResponseWriter, r *http.Request) (int64, error) {
	rememberValue, err := utils.CheckSession("remember_me_token", r)
	if err != nil {
		return 0, err
	}

	rememberMe, err := auth.SelectUserRememberMe(rememberValue)
	if err != nil || rememberMe == nil || rememberMe.IsExpired() {
		return 0, err
	}

	// create new session
	s := renewSession(rememberMe.UserId, r)
	if err := auth.InsertRegisterUserSession(s); err != nil {
		return 0, err
	}
	setSessionCookie(w, s)

	// update the remeber me
	if err := auth.UpdateRememberMeToken(s.SessionId, rememberMe, rememberMe.UserId); err != nil {
		return 0, err
	}
	setRememberMeCookie(w, rememberMe)

	return rememberMe.UserId, nil
}

func setSessionCookie(w http.ResponseWriter, s *auth.SessionResponseJson) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    s.SessionToken,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})
}

func setRememberMeCookie(w http.ResponseWriter, rememberMe *auth.RememberMeSqlRow) {
	http.SetCookie(w, &http.Cookie{
		Name:     "remember_me_token",
		Value:    rememberMe.Selector + ":" + rememberMe.Token,
		Expires:  time.Now().Add(90 * 24 * time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})
}

func renewSession(userId int64, r *http.Request) *auth.SessionResponseJson {
	return &auth.SessionResponseJson{
		SessionId:    utils.GenerateID(),
		UserId:       userId,
		SessionToken: utils.GenerateSessionToken(256),
		IpAddress:    r.RemoteAddr,
		Device:       r.Header.Get("User-Agent"),
		ExpiresAt:    time.Now().UTC().Add(24 * time.Hour).Format(time.RFC3339),
	}
}
