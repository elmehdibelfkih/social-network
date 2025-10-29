package utils

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	config "social/pkg/config"

	"time"
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

	sqliteFile, err = os.OpenFile(sqlitePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Failed to open sqlite.log: %v", err)
	}
	sqliteLog = log.New(sqliteFile, "", log.LstdFlags)
	sqliteLog.Printf("SQLite log initialized at: %s\n", sqlitePath)

	backendFile, err = os.OpenFile(backendPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("Failed to open backend.log: %v", err)
	}
	backendLog = log.New(backendFile, "", log.LstdFlags)
	backendLog.Printf("Backend log initialized at: %s\n", backendPath)
}

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

func LogSQLiteError(err error, query string) {
	if err != nil {
		sqliteLog.Printf("[%s] %v: %s",
			time.Now().Format(time.RFC3339), err, query)
	}
}

func LogBackendError(err error, context string) {
	if err != nil {
		backendLog.Printf("[%s] %v: %s",
			time.Now().Format(time.RFC3339), err, context)
	}
}

func HandleSQLiteError(err error, query string) bool {
	if err != nil {
		LogSQLiteError(err, query)
		return true
	}
	return false
}

func HandleBackendError(err error, context string) bool {
	if err != nil {
		LogBackendError(err, context)
		return true
	}
	return false
}

func SQLiteErrorTarget(err error, query string) {
	_, file, line, _ := runtime.Caller(1)
	HandleSQLiteError(fmt.Errorf("%s:%d: %w", file, line, err), query)
}

func BackendErrorTarget(err error, context string) {
	_, file, line, _ := runtime.Caller(1)
	HandleBackendError(fmt.Errorf("%s:%d: %w", file, line, err), context)
}
