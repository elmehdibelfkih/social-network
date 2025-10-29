package database

import (
	"database/sql"
	config "social/pkg/config"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func InitDB() error {
	var err error
	config.DB, err = sql.Open(config.DATABASE_DRIVER, config.DATABASE_PATH)
	if err != nil {
		return err
	}
	defer config.DB.Close()

	_, err = config.DB.Exec(config.FOREIGN_KEYS_ON)
	if err != nil {
		return err
	}

	// create schema_migrations to track version controll
	instance, err := sqlite3.WithInstance(config.DB, &sqlite3.Config{})
	if err != nil {
		return err
	}

	migration, err := migrate.NewWithDatabaseInstance(config.MIGRATION_PATH, config.DATABASE_DRIVER, instance)
	if err != nil {
		return err
	}

	err = migration.Up()
	if err != nil && err != migrate.ErrNoChange {
		return err
	}

	return nil
}

// for all write operation u should wrap them with this wrapper insert/update/delete
func WrapWithTransaction(fn func(*sql.Tx) error) error {
	var err error
	tx, err := config.DB.Begin()
	if err != nil {
		return err
	}

	err = fn(tx)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}
