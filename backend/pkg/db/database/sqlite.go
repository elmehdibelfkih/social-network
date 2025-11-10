package database

import (
	"database/sql"
	config "social/pkg/config"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

const USER_ENTITY_TYPE = `user`
const POST_ENTITY_TYPE = `post`
const GROUP_ENTITY_TYPE = `group`
const COMMENT_ENTITY_TYPE = `comment`

const FOLLOWERS_ENTITY_NAME = "followers"
const POSTS_ENTITY_NAME = "posts"
const COMMENTS_ENTITY_NAME = "comments"
const REACTIONS_ENTITY_NAME = "reactions"
const SHARSE_ENTITY_TYPE = "shares"

const ACTION_INCREMENT = "increment"
const ACTION_DECREMENT = "decrement"


type DBCounter struct {
	CounterName string
	EntityType  string
	EntityID    int64
	Action      string //++ or --	
}

const UPDATE_COUNT = `
    INSERT INTO counters (
      entity_type,
      entity_id,
      followers_count,
      posts_count,
      comments_count,
      reactions_count,
      shares_count
    )
    VALUES (
      ?2, -- entity_type
      ?3, -- entity_id
      CASE WHEN ?1 = 'followers' THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      CASE WHEN ?1 = 'posts'     THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      CASE WHEN ?1 = 'comments'  THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      CASE WHEN ?1 = 'reactions' THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      CASE WHEN ?1 = 'shares'    THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END
    )
    ON CONFLICT (entity_type, entity_id) DO UPDATE SET
      followers_count = followers_count + CASE WHEN ?1 = 'followers' THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      posts_count     = posts_count     + CASE WHEN ?1 = 'posts'     THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      comments_count  = comments_count  + CASE WHEN ?1 = 'comments'  THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      reactions_count = reactions_count + CASE WHEN ?1 = 'reactions' THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      shares_count    = shares_count    + CASE WHEN ?1 = 'shares'    THEN (CASE WHEN ?4 = 'increment' THEN 1 ELSE -1 END) ELSE 0 END,
      updated_at = CURRENT_TIMESTAMP;
`

func InitDB() error {
	var err error
	config.DB, err = sql.Open(config.DATABASE_DRIVER, config.DATABASE_PATH)
	if err != nil {
		return err
	}
	// defer config.DB.Close()

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

func UpdateCounter(tx *sql.Tx, counter DBCounter) error {
	_, err := tx.Exec(UPDATE_COUNT, counter.CounterName, counter.EntityType, counter.EntityID, counter.Action)
	return err
}
