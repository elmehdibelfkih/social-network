package media

import (
	"database/sql"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"

	"social/pkg/config"
	"social/pkg/utils"
)

func getStoragePathForPurpose(context string) string {
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

func canDeleteMedia(userID, mediaID int64) bool {
	var mediaOwnerID int64

	err := config.DB.QueryRow(QUERY_GET_MEDIA_OWNER, mediaID).Scan(&mediaOwnerID)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_MEDIA)
		return false
	}

	if mediaOwnerID == userID {
		return true
	}
	return false
}

func canGetMedia(userID, mediaID int64) bool {
	var mediaOwnerID int64
	var mediaPurpose string

	err := config.DB.QueryRow(QUERY_GET_MEDIA_OWNER_AND_PURPOSE, mediaID).Scan(&mediaOwnerID, mediaPurpose)
	if err != nil {
		if err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, QUERY_GET_MEDIA_OWNER_AND_PURPOSE)
		}
		return false
	}

	if mediaOwnerID == userID {
		return true
	}

	switch mediaPurpose {
	case "avatar":
		return true

	case "post", "comment":
		var visibility string
		var authorID int64
		var postID int64

		err := config.DB.QueryRow(QUERY_GET_POST_VISIBILITY_FROM_POST_MEDIA, mediaID).Scan(&postID, &visibility, &authorID)
		if err != nil {
			if err != sql.ErrNoRows {
				utils.SQLiteErrorTarget(err, QUERY_GET_POST_VISIBILITY_FROM_POST_MEDIA)
			}
			return false
		}

		switch visibility {
		case "public":
			return true

		case "private":
			if authorID == userID {
				return true
			}
			return isUserOnList(userID, postID)

		case "followers":
			return checkFollow(userID, authorID)

		case "restricted":
			return isUserOnList(userID, postID)

		case "group":
			return isGroupMember(userID, postID)
		}

	case "message":
		var exists int
		err := config.DB.QueryRow(QUERY_CHECK_MESSAGE_MEDIA_VISIBILITY, mediaID, userID).Scan(&exists)
		if err != nil {
			if err != sql.ErrNoRows {
				utils.SQLiteErrorTarget(err, QUERY_CHECK_MESSAGE_MEDIA_VISIBILITY)
			}
			return false
		}
		return true
	}

	return false
}

func checkFollow(requesterID, authorID int64) bool {
	var exists int
	err := config.DB.QueryRow(QUERY_CHECK_FOLLOW, requesterID, authorID).Scan(&exists)
	if err != nil {
		if err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, "checkFollow")
		}
		return false
	}
	return true
}

func isGroupMember(userID, groupID int64) bool {
	var exists int
	if groupID == 0 {
		return false
	}
	err := config.DB.QueryRow(QUERY_CHECK_GROUP_MEMBERSHIP, groupID, userID).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		utils.SQLiteErrorTarget(err, "isUserInGroup")
	}
	return exists == 1
}

func isUserOnList(userID, postID int64) bool {
	var exists int
	err := config.DB.QueryRow(QUERY_CHECK_POST_ALLOWED_VIEWERS, postID, userID).Scan(&exists)
	if err != nil && err != sql.ErrNoRows {
		utils.SQLiteErrorTarget(err, "isUserOnList")
	}
	return exists == 1
}
