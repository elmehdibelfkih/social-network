package config

const (
	DATABASE_DRIVER = "sqlite3"
	DATABASE_PATH   = "./db/social.db"
	MIGRATION_PATH = "file://./db/migrations"
	FOREIGN_KEYS_ON = "PRAGMA foreign_keys = ON;"
)
