package utils

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	config "social/pkg/config"
	"strconv"
	"strings"

	"github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func IdentifySqlError(w http.ResponseWriter, err error) {
	if errors.Is(err, sql.ErrNoRows) {
		BadRequest(w, "Record not found", "alert")
		return
	}
	var sqliteErr sqlite3.Error
	if errors.As(err, &sqliteErr) {
		switch sqliteErr.ExtendedCode {
		case sqlite3.ErrConstraintUnique:
			BadRequest(w, getDuplicatedColumn(err.Error()), "alert")
			return
		case sqlite3.ErrConstraintForeignKey:
			BadRequest(w, "Cannot perform this action: linked data exists", "alert")
			return
		}
	}
	InternalServerError(w)
}

func getDuplicatedColumn(errStr string) string {
	const prefix = "UNIQUE constraint failed: "
	field := strings.TrimPrefix(errStr, prefix)
	parts := strings.Split(field, ".")
	return parts[len(parts)-1] + "already Exists"
}

func GetQuerryPramInt(r *http.Request, key string) int64 {
	queryParams := r.URL.Query()
	n, err := strconv.ParseInt(queryParams.Get(key), 10, 64)
	if err != nil {
		return 0
	}
	return n
}

func GetQuerryPramString(r *http.Request, key string) string {
	queryParams := r.URL.Query()
	return queryParams.Get(key)
}

func OptionalJsonFields[T any](arg *T) any {
	if arg != nil {
		return *arg
	}
	return nil
}

func GetWildCardValue(w http.ResponseWriter, r *http.Request, key string) int64 {
	slug := r.PathValue(key)
	wildCard, err := strconv.ParseInt(slug, 10, 64)
	if err != nil {
		BackendErrorTarget(err, "UserContext")
		NotFoundError(w, "not found")
	}
	return wildCard
}

func GetUserIdFromContext(r *http.Request) int64 {
	var userId int64 = -1
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
