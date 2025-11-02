package media

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"

	"social/pkg/config"
	"social/pkg/utils"
)

func getStoragePathForContext(context string) string {
	switch context {
	case "avatar":
		return filepath.Join("../data/uploads/avatars")
	case "post":
		return filepath.Join("../data/uploads/posts")
	case "message":
		return filepath.Join("../data/uploads/messages")
	case "comment":
		return filepath.Join("../data/uploads/comments")
	default:
		return filepath.Join("../data/uploads/posts")
	}
}

func getMediaID(r *http.Request) (int64, error) {
	mediaIDStr := r.PathValue("media_id")
	if mediaIDStr == "" {
		return 0, fmt.Errorf("the 'media_id' query parameter is required")
	}

	id, err := strconv.ParseInt(mediaIDStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("the 'media_id' must be a valid integer")
	}

	return id, nil
}

func canGetMedia(userID, mediaID int64) bool {
	var media Media

	err := config.DB.QueryRow(QUERY_GET_MEDIA, mediaID).Scan(&media)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_MEDIA)
		return false
	}

	if media.Purpose == "message" && media.OwnerId != userID {
		return false
	}
	return true
}

func canDeleteMedia(userID, mediaID int64) bool {
	// if the user is the owner of the media can he delte it?
	var media Media

	err := config.DB.QueryRow(QUERY_GET_MEDIA, mediaID).Scan(&media)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_MEDIA)
		return false
	}

	if media.OwnerId == int64(userID) {
		return true
	}
	return false
}
