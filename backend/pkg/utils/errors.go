package utils

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"time"

	config "social/pkg/config"
)

var (
	sqliteLog   *log.Logger
	backendLog  *log.Logger
	sqliteFile  *os.File
	backendFile *os.File
	sqlitePath  string
	backendPath string
)

func InitLogger() {
	var err error

	sqlitePath, _ = filepath.Abs(config.SQL_LOG_FILE_PATH)
	backendPath, _ = filepath.Abs(config.BACKEND_LOG_FILE_PATH)

	sqliteFile, err = os.OpenFile(sqlitePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		log.Fatalf("Failed to open sqlite.log: %v", err)
	}
	sqliteLog = log.New(sqliteFile, "", log.LstdFlags)
	sqliteLog.Printf("SQLite log initialized at: %s\n", sqlitePath)

	backendFile, err = os.OpenFile(backendPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		log.Fatalf("Failed to open backend.log: %v", err)
	}
	backendLog = log.New(backendFile, "", log.LstdFlags)
	backendLog.Printf("Backend log initialized at: %s\n", backendPath)
}

// todo:
func CloseLogger() {
	if sqliteFile != nil {
		sqliteLog.Printf("Server shutdown.\n\n\n")
		sqliteFile.Close()
	}
	if backendFile != nil {
		backendLog.Printf("Server shutdown.\n\n\n")
		backendFile.Close()
	}
}

func logSQLiteError(err error, query string) {
	if err != nil {
		sqliteLog.Printf("[%s]\n %v:\n %s\n",
			time.Now().Format(time.RFC3339), err, query)
	}
}

func logBackendError(err error, context string) {
	if err != nil {
		backendLog.Printf("[%s]\n %v:\n %s\n",
			time.Now().Format(time.RFC3339), err, context)
	}
}

func handleSQLiteError(err error, query string) bool {
	if err != nil {
		logSQLiteError(err, query)
		return true
	}
	return false
}

func handleBackendError(err error, context string) bool {
	if err != nil {
		logBackendError(err, context)
		return true
	}
	return false
}

func SQLiteErrorTarget(err error, query string) {
	_, file, line, _ := runtime.Caller(1)
	handleSQLiteError(fmt.Errorf("%s:%d:\n %w", file, line, err), query)
}

func BackendErrorTarget(err error, context string) {
	_, file, line, _ := runtime.Caller(1)
	handleBackendError(fmt.Errorf("%s:%d:\n %w", file, line, err), context)
}

// func ValidateJsonRequest(r *http.Request, body any, context string) bool {
// 	err := JsonStaticDecode(r, &body)
// 	if err != nil {
// 		BackendErrorTarget(err, context)
// 		return false
// 	}
// 	return true
// }

func sendErrorResponse(w http.ResponseWriter, status int, errTitle, errMsg, errType string) {
	JsonResponseEncode(w, status, map[string]any{
		"success": false,
		// "payload": errMsg,
		"error": map[string]any{
			"errorTitle":   errTitle,
			"statusCode":   status,
			"statusText":   http.StatusText(status),
			"errorMessage": errMsg,
			"errorType":    errType,
		},
	})
}

func NotFoundError(w http.ResponseWriter, message string) {
	sendErrorResponse(w, http.StatusNotFound, "Resource Not Found", message, "redirect")
}

func MethodNotAllowed(w http.ResponseWriter, message string) {
	sendErrorResponse(w, http.StatusMethodNotAllowed, "Method Not Allowed", message, "redirect")
}

func InternalServerError(w http.ResponseWriter) {
	sendErrorResponse(w, http.StatusInternalServerError, "Oops! Internal Server Error", "An unexpected error occurred while processing your request.", "redirect")
}

func BadRequest(w http.ResponseWriter, message, errorType string) {
	sendErrorResponse(w, http.StatusBadRequest, "Bad Request", message, errorType)
}

func Unauthorized(w http.ResponseWriter, message string) {
	sendErrorResponse(w, http.StatusUnauthorized, "Unauthorized", message, "alert")
}

func TooManyRequests(w http.ResponseWriter, message string) {
	sendErrorResponse(w, http.StatusTooManyRequests, "Too Many Requests", message, "redirect")
}

func UnsupportedMediaType(w http.ResponseWriter) {
	sendErrorResponse(w, http.StatusUnsupportedMediaType, "Invalid File Type", "Only JPEG, PNG, and GIF files are allowed.", "alert")
}

func MediaTooLargeError(w http.ResponseWriter, message string) {
	sendErrorResponse(w, http.StatusRequestEntityTooLarge, "File Too Large", message, "alert")
}

func ForbiddenError(w http.ResponseWriter, message string) {
	sendErrorResponse(w, http.StatusForbidden, "Forbidden", message, "alert")
}
