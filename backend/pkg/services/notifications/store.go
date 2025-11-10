package notifications

import (
	"database/sql"

	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"
)

func CreateNotification(userID int64, nType string, refType sql.NullString, refID sql.NullInt64, content sql.NullString) error {
	notifID := utils.GenerateID()

	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(QUERY_CREATE_NOTIFICATION, notifID, userID, nType, refType, refID, content)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_CREATE_NOTIFICATION)
			return err
		}
		return nil
	})
}

func GetNotifications(userID int64, limit, offset int) ([]*Notification, error) {
	rows, err := config.DB.Query(QUERY_GET_NOTIFICATIONS_PAGINATED, userID, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_NOTIFICATIONS_PAGINATED)
		return nil, err
	}
	defer rows.Close()

	var notifications []*Notification
	for rows.Next() {
		n := &Notification{}
		err := rows.Scan(
			&n.ID, &n.UserID, &n.Type, &n.ReferenceType,
			&n.ReferenceID, &n.Content, &n.IsRead,
			&n.CreatedAt, &n.ReadAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, "GetNotifications (Scan)")
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

func GetNotificationOwner(notifID int64) int64 {
	var ownerID int64
	err := config.DB.QueryRow(QUERY_GET_NOTIFICATION_OWNER, notifID).Scan(&ownerID)
	if err != nil {
		utils.SQLiteErrorTarget(err, QUERY_GET_NOTIFICATION_OWNER)
		return -1
	}
	return ownerID
}

func GetUnreadCount(userID int64) (int, error) {
	var count int
	err := config.DB.QueryRow(QUERY_GET_UNREAD_NOTIFICATION_COUNT, userID).Scan(&count)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, nil
		}
		utils.SQLiteErrorTarget(err, QUERY_GET_UNREAD_NOTIFICATION_COUNT)
		return 0, err
	}
	return count, nil
}

func MarkNotificationRead(userID, notificationID int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		res, err := tx.Exec(QUERY_MARK_NOTIFICATION_AS_READ, notificationID, userID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_MARK_NOTIFICATION_AS_READ)
			return err
		}

		rowsAffected, err := res.RowsAffected()
		if err != nil {
			utils.SQLiteErrorTarget(err, "MarkNotificationRead (RowsAffected)")
			return err
		}

		if rowsAffected == 0 {
			return sql.ErrNoRows
		}

		return nil
	})
}

func MarkAllNotificationsRead(userID int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		res, err := tx.Exec(QUERY_MARK_ALL_NOTIFICATIONS_AS_READ, userID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_MARK_ALL_NOTIFICATIONS_AS_READ)
			return err
		}

		rowsAffected, err := res.RowsAffected()
		if err != nil {
			utils.SQLiteErrorTarget(err, "MarkAllNotificationRead (RowsAffected)")
			return err
		}

		if rowsAffected == 0 {
			return sql.ErrNoRows
		}

		return nil
	})
}

func DeleteNotification(userID, notificationID int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(QUERY_DELETE_NOTIFICATION, notificationID, userID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_DELETE_NOTIFICATION)
			return err
		}
		return nil
	})
}

func DeleteAllNotifications(userID int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(QUERY_DELETE_ALL_NOTIFICATIONS_BY_USER, userID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_DELETE_ALL_NOTIFICATIONS_BY_USER)
			return err
		}
		return nil
	})
}

func ModularNotifisQuery(query string, args []any) ([]*Notification, error) {
	rows, err := config.DB.Query(query, args...)
	if err != nil {
		utils.SQLiteErrorTarget(err, query)
		return nil, err
	}
	defer rows.Close()

	var notifications []*Notification

	for rows.Next() {
		var n Notification
		err := rows.Scan(
			&n.ID, &n.UserID, &n.Type, &n.ReferenceType,
			&n.ReferenceID, &n.Content, &n.IsRead,
			&n.CreatedAt, &n.ReadAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, query)
			return nil, err
		}
		notifications = append(notifications, &n)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, query)
		return nil, err
	}

	return notifications, nil
}
