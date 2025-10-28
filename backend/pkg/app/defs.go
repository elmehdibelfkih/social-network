package app

import "database/sql"

var DB *sql.DB

const (
	// INTERNAL_SERVER_ERROR_LOG_PATH = ""
	PORT               = ":8080"
	SERVER_RUN_MESSAGE = "\033[2mServer running on http://localhost:8080\033[0m"
	DATABASE_DRIVER    = "sqlite3"
	DATABASE_PATH      = "../data/sqlite/social.db"
	MIGRATION_PATH     = "file://./db/migrations"
	FOREIGN_KEYS_ON    = "PRAGMA foreign_keys = ON;"
)
