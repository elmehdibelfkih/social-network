package media

import (
	"os"
	"path/filepath"

	"net/http"
	"social/pkg/config"
	"social/pkg/utils"
)

func getStoragePathForPurpose(purpose string) string {
	baseDir := "../data/media"
	dir := filepath.Join(baseDir, purpose)
	os.MkdirAll(dir, 0755)
	return dir
}

func getMediaID(r *http.Request) (int64, error) {
	return utils.GetWildCardValue(nil, r, "media_id"), nil
}

func canGetMedia(userID, mediaID int64) bool {
	var ownerID int64
	var purpose string
	
	err := config.DB.QueryRow(QUERY_GET_MEDIA_OWNER_AND_PURPOSE, mediaID).Scan(&ownerID, &purpose)
	if err != nil {
		return false
	}
	
	// Owner can always access
	if ownerID == userID {
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
		if err == nil && privacy == "public" {
			return true
		}
	}
	
	return false
}

func canDeleteMedia(userID, mediaID int64) bool {
	var ownerID int64
	err := config.DB.QueryRow(QUERY_GET_MEDIA_OWNER, mediaID).Scan(&ownerID)
	return err == nil && ownerID == userID
}