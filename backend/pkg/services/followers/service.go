package follow

import (
	"database/sql"
	"social/pkg/db/database"
	"social/pkg/utils"
)

func followUser(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(FOLLOW_REQUEST_QUERY,
			followerId, followedId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, FOLLOW_REQUEST_QUERY)
			return err
		}
		return nil
		// todo: create notification
	})
}

func unfollowUser(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(UNFOLLOW_REQUEST_QUERY,
			followerId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}
		return nil
	})
}

// func createdFollowRequestNotification(targetUser int64) {

// }

func createNotification(userId int64, notifType string, referenceId int64, content string) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(
			`INSERT INTO notifications (user_id, type, reference_id, content, created_at)
			 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);`,
			userId, notifType, referenceId, content,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, "CREATE_NOTIFICATION_QUERY")
			return err
		}
		return nil
	})
}

func followNotification(followerId, followedId int64) Notification {
	var notification Notification

	notification.UserID = followedId
	notification.ReferenceID = followerId
	return notification
}
