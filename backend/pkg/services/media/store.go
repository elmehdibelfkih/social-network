package auth

import (
	"database/sql"
	"fmt"
	"os"

	"social/pkg/utils"

	"github.com/mattn/go-sqlite3"
)

type DBStore struct {
	db *sql.DB
}

func NewDBStore(db *sql.DB) *DBStore {
	return &DBStore{
		db: db,
	}
}

func (s *DBStore) CreateMedia(media *Media) error {
	_, err := s.db.Exec(queryCreateMedia, media.ID, media.OwnerId, media.Path, media.Mime, media.Purpose, media.CreatedAt)
	if err != nil {
		if e, ok := err.(sqlite3.Error); ok && e.Code == sqlite3.ErrConstraint {
			return fmt.Errorf("constraint error: %w", err)
		}
		utils.LogSQLiteError(err, "CreateMedia")
		return fmt.Errorf("failed to create media: %s", err)
	}
	return nil
}

func (s *DBStore) GetMediaByID(id uint64) (*Media, error) {
	media := &Media{}
	err := s.db.QueryRow(queryGetMedia, id).Scan(
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
		utils.LogSQLiteError(err, "GetMediaByID")
		return nil, fmt.Errorf("failed to get media: %w", err)
	}
	return media, nil
}

func (s *DBStore) DeleteMedia(id uint64, userID uint64) (string, error) {
	var path string
	var owner_id uint64

	tx, err := s.db.Begin()
	if err != nil {
		utils.LogSQLiteError(err, "DeleteMedia (BeginTx)")
		return "", err
	}
	defer tx.Rollback()

	err = tx.QueryRow(queryGetMedia, id).Scan(&owner_id, &path)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", sql.ErrNoRows
		}
		utils.LogSQLiteError(err, "DeleteMedia (QueryRow)")
		return "", err
	}

	if owner_id != userID {
		return "", fmt.Errorf("Forbidden: media doesn't belong to this owner")
	}

	_, err = tx.Exec(queryDeleteMedia, id, userID)
	if err != nil {
		utils.LogSQLiteError(err, "DeleteMedia (Exec)")
		return "", err
	}

	if err := tx.Commit(); err != nil {
		utils.LogSQLiteError(err, "DeleteMedia (Commit)")
		return "", err
	}

	if err := os.Remove(path); err != nil {
		utils.LogBackendError(err, fmt.Sprintf("failed to delete media file: %s", path))
	}

	return path, nil
}
