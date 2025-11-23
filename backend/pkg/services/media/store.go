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

func CreateMedia(media *Media) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(QUERY_CREATE_MEDIA, media.ID, media.OwnerId, media.Path, media.Mime, media.Size, media.Purpose, media.CreatedAt)
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

func GetMediaByID(id int64) (*Media, error) {
	media := &Media{}
	err := config.DB.QueryRow(QUERY_GET_MEDIA, id).Scan(
		&media.ID,
		&media.OwnerId,
		&media.Path,
		&media.Mime,
		&media.Size,
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

func DeleteMedia(mediaID int64, userID int64) (string, error) {
	var media Media
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(QUERY_GET_MEDIA, mediaID).Scan(
			&media.ID,
			&media.OwnerId,
			&media.Path,
			&media.Mime,
			&media.Size,
			&media.Purpose,
			&media.CreatedAt,
		)
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
		return nil
	})

	if err != nil {
		return "", err
	}

	if err := os.Remove(media.Path); err != nil {
		utils.BackendErrorTarget(err, fmt.Sprintf("failed to delete media file: %s", media.Path))
	}

	return media.Path, nil
}
