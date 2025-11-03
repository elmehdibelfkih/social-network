package notifications

const (
	QUERY_CREATE_NOTIFICATION = `
		INSERT INTO notifications (id, user_id, type, reference_type, reference_id, content, is_read, created_at, read_at)
		VALUES(?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, ?);
	`

	QUERY_GET_ALL_NOTIFICATIONS = `
		SELECT *
		FROM notifications
		WHERE user_id = ?;
	`

	QUERY_MARK_NOTIFICATION_AS_READ = `
		UPDATE notifications
		SET is_read = 1,
    		read_at = CURRENT_TIMESTAMP
		WHERE id = ? AND user_id = ?;
	`

	QUERY_MARK_ALL_NOTIFICATIONS_AS_READ = `
		UPDATE notifications
		SET is_read = 1,
			read_at = CURRENT_TIMESTAMP
		WHERE user_id = ? AND is_read = 0;
	`

	QUERY_DELETE_NOTIFICATION = `
		DELETE FROM notification
		WHERE id = ? AND user_id = ?;
	`

	QUERY_DELETE_ALL_NOTIFICATIONS_BY_USER = `
		DELETE FROM notifications
		WHERE user_id = ?;
	`

	QUERY_GET_UNREAD_NOTIFICATION_COUNT = `
    	SELECT COUNT(*) 
    	FROM notifications
    	WHERE user_id = ? AND is_read = 0;
	`

	QUERY_GET_NOTIFICATIONS_PAGINATED = `
    	SELECT *
    	FROM notifications
    	WHERE user_id = ?
    	ORDER BY created_at DESC
    	LIMIT ? OFFSET ?;
	`
)
