package media

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
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
