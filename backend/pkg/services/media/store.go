package media

import (
	"database/sql"
	"fmt"
	"os"

	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"

	"github.com/mattn/go-sqlite3"
)

//todo: the db *sql.DB alredy exist in the global config (3ndak database dyalk bo7dak hna la. 🙅)
//todo: use the WrapWithTransaction from the database package to secure database operations
// todo: the query names must follow the macros style
//todo use GetUserIdFromContext from the utils package to get user id

type DBStore struct {
	db *sql.DB
}

func NewDBStore() *DBStore {
	return &DBStore{
		db: config.DB,
	}
}

func (s *DBStore) CreateMedia(media *Media) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := s.db.Exec(QUERY_CREATE_MEDIA, media.ID, media.OwnerId, media.Path, media.Mime, media.Purpose, media.CreatedAt)
		if err != nil {
			if e, ok := err.(sqlite3.Error); ok && e.Code == sqlite3.ErrConstraint {
				return fmt.Errorf("constraint error: %w", err)
			}
			utils.SQLiteErrorTarget(err, "CreateMedia")
			return fmt.Errorf("failed to create media: %s", err)
		}
		return nil
	})

	return err
}

func (s *DBStore) GetMediaByID(id int64) (*Media, error) {
	media := &Media{}
	err := s.db.QueryRow(QUERY_GET_MEDIA, id).Scan(
		&media.ID,
		&media.OwnerId,
		&media.Path,
		&media.Mime,
		&media.Purpose,
		&media.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		utils.SQLiteErrorTarget(err, "GetMediaByID")
		return nil, fmt.Errorf("failed to get media: %w", err)
	}
	return media, nil
}

func (s *DBStore) DeleteMedia(mediaID int64, userID int64) (string, error) {
	var path string
	database.WrapWithTransaction(func(tx *sql.Tx) error {
		defer tx.Rollback()

		err := tx.QueryRow(QUERY_GET_MEDIA, mediaID).Scan(&path)
		if err != nil {
			if err == sql.ErrNoRows {
				return sql.ErrNoRows
			}
			utils.SQLiteErrorTarget(err, "DeleteMedia (QueryRow)")
			return err
		}
		_, err = tx.Exec(QUERY_DELETE_MEDIA, mediaID, userID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "DeleteMedia (Exec)")
			return err
		}

		if err := tx.Commit(); err != nil {
			utils.SQLiteErrorTarget(err, "DeleteMedia (Commit)")
			return err
		}
		return nil
	})

	if err := os.Remove(path); err != nil {
		utils.BackendErrorTarget(err, fmt.Sprintf("failed to delete media file: %s", path))
	}

	return path, nil
}
