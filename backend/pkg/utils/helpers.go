package utils

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	config "social/pkg/config"
	"strconv"

	"golang.org/x/crypto/bcrypt"
)

func OptionalJsonFields[T any](arg *T) any {
	if arg != nil {
		return *arg
	}
	return nil
}

func GetWildCardValue(w http.ResponseWriter, r *http.Request, key string) int64 {
	fmt.Println(r.URL.Path)
	slug := r.PathValue(key)
	fmt.Println(slug)
	wildCard, err := strconv.ParseInt(slug, 10, 64)
	if err != nil {
		BackendErrorTarget(err, "UserContext")
		InternalServerError(w)
	}
	return wildCard
}

func GetUserIdFromContext(r *http.Request) int64 {
	var userId int64
	if r.Context().Value(config.USER_ID_KEY) != nil {
		userId = r.Context().Value(config.USER_ID_KEY).(int64)
	}
	return userId
}

func GetUserSession(w http.ResponseWriter, r *http.Request) (string, error) {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		return "", err
	}
	return cookie.Value, err
}

// this function is used to recive a json with an undefined format
func JsonDynamicDecode(r *http.Request) (any, error) {
	var data any
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		return nil, err
	}
	return data, err
}

func JsonStaticDecode(r *http.Request, v any) error {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&v)
	if err != nil {
		return err
	}
	return nil
}

func JsonResponseEncode(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func WriteSuccess(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(APISuccessResponse{
		Success: true,
		Payload: payload,
	})
}

func GeneratePasswordHash(password *string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	*password = string(bytes)
	return err
}

func CheckPasswordHash(password, hash string) bool {
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

func CheckSession(name string, r *http.Request) (string, error) {
	session, err := r.Cookie(name)
	if err != nil {
		BackendErrorTarget(err, "auth")
		return "", nil
	}
	return session.Value, err
}
