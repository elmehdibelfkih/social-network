package notifications

const (
	QUERY_GET_NOTIFICATION = `
		SELECT id, user_id, type, reference_type, reference_id, content, status, is_read, created_at, read_at, actor_id, actor_name, actor_avatar_id
		FROM notifications
	`

	QUERY_GET_NOTIFICATION_OWNER = `
		SELECT user_id
		FROM notifications
		WHERE id = ?;
	`

	QUERY_CREATE_NOTIFICATION = `
		INSERT INTO notifications (id, user_id, type, reference_type, reference_id, content, is_read, created_at, read_at)
		VALUES(?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, NULL);
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
		DELETE FROM notifications
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

	QUERY_GET_NOTIFICATIONS_BY_COUNT = `
		SELECT COUNT (*) FROM notifications;
	`
)
