package media

import (
	"database/sql"

	"social/pkg/config"
	"social/pkg/utils"
)

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