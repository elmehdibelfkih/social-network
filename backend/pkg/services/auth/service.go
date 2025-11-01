package auth

import (
	"crypto/rand"
	"encoding/base64"
	"log"
	"net/http"
	"social/pkg/utils"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func LoginUserHttp(w http.ResponseWriter, response LoginResponseJson) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    GenerateSessionToken(32),
		Expires:  time.Now().Add(time.Hour / 12),
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

func RegisterUserHttp(w http.ResponseWriter, response RegisterResponseJson) {
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    GenerateSessionToken(32),
		Expires:  time.Now().Add(time.Hour / 12),
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

func LogoutUserAccount(w http.ResponseWriter, r *http.Request, response *LoginResponseJson, context string) bool {
	userId := utils.GetUserIdFromContext(r)
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	err := DeleteUserSession(userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}

	return true
}

func LoginUserAccount(w http.ResponseWriter, r *http.Request, body *LoginRequestJson, response *LoginResponseJson, context string) bool {
	var s = SessionResponseJson{
		SessionId:    int64(utils.GenerateID()),
		UserId:       response.UserId,
		SessionToken: GenerateSessionToken(32),
		IpAddress:    r.RemoteAddr,
		Device:       r.Header.Get("User-Agent"),
	}

	err := InsertLoginUserSession(s, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}

	return true
}

func RegisterUserAccount(w http.ResponseWriter, r *http.Request, body *RegisterRequestJson, context string) (RegisterResponseJson, bool) {
	response, err := InsertUserAccount(*body)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	var s = SessionResponseJson{
		SessionId:    int64(utils.GenerateID()),
		UserId:       response.UserId,
		SessionToken: GenerateSessionToken(32),
		IpAddress:    r.RemoteAddr,
		Device:       r.Header.Get("User-Agent"),
	}

	err = InsertRegisterUserSession(s)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return response, false
	}

	return response, true
}

func GeneratePasswordHash(w http.ResponseWriter, body *RegisterRequestJson, context string) bool {
	err := generatePasswordHash(&body.Password)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}

func generatePasswordHash(password *string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	*password = string(bytes)
	return err
}

func CheckPasswordHash(w http.ResponseWriter, body *LoginRequestJson, response *LoginResponseJson, context string) bool {
	userId, password_hash, err := SelectUserPasswordHash(*body)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	response.UserId = userId
	if !checkPasswordHash(body.Password, password_hash) {
		utils.BackendErrorTarget(err, context)
		utils.InternalServerError(w)
		return false
	}
	return true
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateSessionToken(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		log.Fatalf("failed to generate token %v", err)
	}
	return base64.URLEncoding.EncodeToString(bytes)
}
