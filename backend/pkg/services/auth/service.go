package auth

import (
	"net/http"
	"social/pkg/utils"
	"time"
)

func RegisterUserAccount(w http.ResponseWriter, r *http.Request, body *RegisterRequestJson, s *SessionResponseJson, context string) (RegisterResponseJson, bool) {
	response, err := InsertUserAccount(*body)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	s.SessionId = utils.GenerateID()
	s.UserId = response.UserId
	s.SessionToken = utils.GenerateSessionToken(256)
	s.IpAddress = r.RemoteAddr
	s.Device = r.Header.Get("User-Agent")

	err = InsertRegisterUserSession(s)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	return response, true
}

func RegisterUserHttp(w http.ResponseWriter, response RegisterResponseJson, s SessionResponseJson) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    s.SessionToken,
		Expires:  time.Now().Add(time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	//todo:maybe online broadcast
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func LoginUserAccount(w http.ResponseWriter, r *http.Request, body *LoginRequestJson, response *LoginResponseJson, s *SessionResponseJson, context string) bool {
	s.SessionId = utils.GenerateID()
	s.UserId = response.UserId
	s.SessionToken = utils.GenerateSessionToken(256)
	s.IpAddress = r.RemoteAddr
	s.Device = r.Header.Get("User-Agent")
	err := InsertLoginUserSession(s, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}

func LoginUserHttp(w http.ResponseWriter, response LoginResponseJson, s SessionResponseJson) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    s.SessionToken,
		Expires:  time.Now().Add(time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	//todo:maybe online broadcast
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func LogoutUserAccount(w http.ResponseWriter, r *http.Request, context string) bool {
	userId := utils.GetUserIdFromContext(r)
	session, err := utils.GetUserSession(w, r)
	if err != nil {
		utils.BackendErrorTarget(err, "UserContext")
		utils.Unauthorized(w, "session value is empty")
		return false
	}
	err = DeleteUserSession(session, userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}

func LogoutUserHttp(w http.ResponseWriter, response LogoutResponseJson) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		// SameSite: http.SameSiteStrictMode,
		Path: "/",
	})
	response.Message = "Logout successful."
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func GetUserSession(w http.ResponseWriter, r *http.Request, response *SessionResponseJson, context string) bool {
	userId := utils.GetUserIdFromContext(r)
	session, err := utils.GetUserSession(w, r)
	if err != nil {
		utils.BackendErrorTarget(err, "UserContext")
		utils.Unauthorized(w, "session value is empty")
		return false
	}
	err = SelectUserSessionById(response, session, userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}

func GetUserSessionHttp(w http.ResponseWriter, response SessionResponseJson) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func GetUserSessions(w http.ResponseWriter, r *http.Request, response *SessionsResponseJson, context string) bool {
	userId := utils.GetUserIdFromContext(r)
	session, err := utils.GetUserSession(w, r)
	if err != nil {
		utils.BackendErrorTarget(err, "UserContext")
		utils.Unauthorized(w, "session value is empty")
		return false
	}
	err = SelectUserSessionsById(response, session, userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}

func GetUserSessionsHttp(w http.ResponseWriter, response SessionsResponseJson) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func DeleteSessionBySessionId(w http.ResponseWriter, r *http.Request, sessionId int64, context string) bool {
	if sessionId == 0 {
		return false
	}
	userId := utils.GetUserIdFromContext(r)
	session, err := utils.GetUserSession(w, r)
	if err != nil {
		utils.BackendErrorTarget(err, "UserContext")
		utils.Unauthorized(w, "session value is empty")
		return false
	}
	err = DeleteUserSession(session, userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}

func DeleteSessionHttp(w http.ResponseWriter, response RevokeSessionResponseJson) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		// SameSite: http.SameSiteStrictMode,
		Path: "/",
	})
	response.Message = "Logout successful."
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func GeneratePasswordHash(w http.ResponseWriter, body *RegisterRequestJson, context string) bool {
	err := utils.GeneratePasswordHash(&body.Password)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}

func CheckPasswordHash(w http.ResponseWriter, body *LoginRequestJson, response *LoginResponseJson, context string) bool {
	userId, password_hash, err := SelectUserPasswordHash(*body)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	response.UserId = userId
	if !utils.CheckPasswordHash(body.Password, password_hash) {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}
