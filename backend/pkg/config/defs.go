package config

import (
	"database/sql"
)

type ContextKey string

// context keys

const (
	USER_ID_KEY      ContextKey = "userId"
)

var DB *sql.DB

const (
	PORT               = ":8080"
	SERVER_RUN_MESSAGE = "\033[2mServer running on http://localhost:8080\033[0m"
	DATABASE_DRIVER    = "sqlite3"
	FOREIGN_KEYS_ON    = "PRAGMA foreign_keys = ON;"
)

// PATHS
const (
	MIGRATION_PATH        = "file://./pkg/db/migrations"
	DATABASE_PATH         = "../data/sqlite/social.db"
	SQL_LOG_FILE_PATH     = "../logs/backend-sqlite.log"
	BACKEND_LOG_FILE_PATH = "../logs/backend.log"
)
