package database

import (
	"database/sql"
	"fmt"
	config "social/pkg/app"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() error {
	var err error
	DB, err = sql.Open(config.DATABASE_DRIVER, config.DATABASE_PATH)
	if err != nil {
		return err
	}
	defer DB.Close()

	instance, err := sqlite3.WithInstance(DB, &sqlite3.Config{})
	if err != nil {
		return err
	}

	migration, err := migrate.NewWithDatabaseInstance(config.MIGRATION_PATH, config.DATABASE_DRIVER, instance)
	if err != nil {
		return err
	}

	err = migration.Up()
	if err != nil && err != migrate.ErrNoChange {
		fmt.Println(err)
		return err
	}

	return nil
}

// for all write operation u should wrap them with this wrapper insert/update/delete
func WrapWithTransaction(fn func(*sql.Tx) error) error{
	var err error
	tx, err := DB.Begin()
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
