package media

import (
	"database/sql"
	"net/http"
	"os"
	"path/filepath"

	"social/pkg/config"
	"social/pkg/utils"
)

func getStoragePathForPurpose(purpose string) string {
	baseDir := "../data/uploads"
	dir := filepath.Join(baseDir, purpose+"s")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		utils.SQLiteErrorTarget(err, "os.MkdirAll")
	}
	return dir
}

func getMediaID(r *http.Request) (int64, error) {
	return utils.GetWildCardValue(nil, r, "media_id"), nil
}

func canGetMedia(userID, mediaID int64) bool {
	var ownerID sql.NullInt64
	var purpose string

	err := config.DB.QueryRow(QUERY_GET_MEDIA_OWNER_AND_PURPOSE, mediaID).Scan(&ownerID, &purpose)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_MEDIA_OWNER_AND_PURPOSE)
		return false
	}

	// Owner can always access
	if ownerID.Valid && ownerID.Int64 == userID {
		return true
	}

	// Avatar images are public
	if purpose == "avatar" {
		return true
	}

	// Post images from public posts are accessible
	if purpose == "post" {
		var postID, authorID int64
		var privacy string
		err := config.DB.QueryRow(QUERY_GET_POST_VISIBILITY_FROM_POST_MEDIA, mediaID).Scan(&postID, &privacy, &authorID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_GET_POST_VISIBILITY_FROM_POST_MEDIA)
			return false
		}
		if privacy == "public" {
			return true
		}
		if privacy == "followers" {
			// Need to check if the user requesting the media is a follower to the owner
			var status sql.NullString
			err := config.DB.QueryRow(QUERY_CHECK_FOLLOW_RELATION, userID, authorID).Scan(&status)
			if err != nil {
				utils.SQLiteErrorTarget(err, QUERY_CHECK_FOLLOW_RELATION)
				return false
			}
			if status.Valid && status.String == "accepted" {
				return true
			}
		}

		if privacy == "restricted" {
			var allowedUserId sql.NullInt64
			err := config.DB.QueryRow(QUERY_CHECK_IS_USER_ALLOWED, postID, userID, authorID).Scan(&allowedUserId)
			if err != nil {
				utils.SQLiteErrorTarget(err, QUERY_CHECK_IS_USER_ALLOWED)
				return false
			}
			if allowedUserId.Valid && allowedUserId.Int64 == userID {
				return true
			}
		}
	}

	return false
}

func canDeleteMedia(userID, mediaID int64) bool {
	var ownerID int64
	err := config.DB.QueryRow(QUERY_GET_MEDIA_OWNER, mediaID).Scan(&ownerID)
	return err == nil && ownerID == userID
}
