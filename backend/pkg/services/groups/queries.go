package groups

// SELECT

const (
	SELECT_GROUP_BY_GROUP_ID = `
		SELECT id, creator_id, title, description, avatar_media_id, created_at, updated_at
		FROM groups
		WHERE id = ?;
	`
	SELECT_FOLLOWS_BY_ID = `
		SELECT EXISTS (
			SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?
		);
	`
	SELECT_GROUP_BY_OWNER = `
		SELECT EXISTS (
			SELECT 1 FROM groups WHERE id = ? AND creator_id = ?
		);
	`
	SELECT_GROUP_MEMBER_BY_ID = `
		SELECT EXISTS (
			SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND status IN ('pending', 'accepted');
		);
	`
	SELECT_GROUP_MEMBER_PENDING = `
		SELECT EXISTS (
			SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'pending';
		);
	`
	SELECT_GROUP_MEMBERS_COUNT = `
		SELECT followers_count FROM counters WHERE entity_type = ? AND entity_id = ?
	`

	// List all groups with pagination
	SELECT_BROWSE_GROUPS = `
		SELECT id, title, description, avatar_media_id, creator_id, created_at
		FROM groups
		WHERE id < ?
		ORDER BY created_at DESC
		LIMIT ?
	`

	// Get members of a group with pagination
	SELECT_GROUP_MEMBERS_BY_GROUP_ID = `
	SELECT 
    gm.user_id, u.first_name, u.last_name, gm.role, gm.joined_at
	FROM group_members AS gm
	JOIN users AS u ON gm.user_id = u.id
	WHERE group_id < ? AND status = 'accepted'
	ORDER BY created_at DESC
	LIMIT ?
	`
	// Count total groups (for pagination)
	SELECT_GROUPS_COUNT = `SELECT COUNT(*) FROM groups;`

	// Get event by event_id
	SELECT_EVENT_BY_ID = `
		SELECT e.id, e.group_id, e.title, e.description, e.start_at, e.end_at, e.location,
		u.id AS created_by_id, u.nickname AS created_by_username, e.created_at
		FROM group_events e
		INNER JOIN users u ON u.id = e.created_by
		WHERE e.id = ?;
	`

	// List all events for a group
	SELECT_EVENTS_BY_GROUP_ID = `
		SELECT id, title, description, start_at, end_at, location, created_by, created_at
		FROM group_events
		WHERE group_id = ?
		ORDER BY start_at ASC;
	`
)

// INSERT

const (
	INSERT_GROUP_BY_USER_ID = `
		INSERT INTO groups (id, creator_id, title, description, avatar_media_id)
		VALUES (?, ?, ?, ?, ?)
		RETURNING id, creator_id, title, description, avatar_media_id, created_at, updated_at;
	`
	INSERT_GROUP_MEMBER_BY_GROUP_ID = `
		INSERT INTO group_members (group_id, user_id, status, role)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(group_id, user_id)
		DO UPDATE SET  status = excluded.status, role = excluded.role, updated_at = CURRENT_TIMESTAMP	
		RETURNING group_id, user_id, status, created_at;
	`

	// Create an event for a group
	INSERT_GROUP_EVENT = `
		INSERT INTO group_events (id, group_id, title, description, start_at, end_at, location, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id, group_id, title, description, start_at, end_at, location, created_by, created_at;
	`

	// RSVP to an event
	INSERT_EVENT_RSVP = `
		INSERT INTO event_rsvps (event_id, user_id, option)
		VALUES (?, ?, ?)
		ON CONFLICT(event_id, user_id)
		DO UPDATE SET option = excluded.option;
	`
)

// UPDATE

const (
	// Update a group’s info
	UPDATE_GROUP_BY_ID = `
		UPDATE groups
		SET title = ?, description = ?, avatar_media_id = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
		RETURNING id, title, description, avatar_media_id, updated_at;
	`

	UPDATE_GROUP_MEMBER_STATUS = `
		UPDATE group_members
		SET status = ?, updated_at = CURRENT_TIMESTAMP
		WHERE group_id = ? AND user_id = ? AND status = 'pending'
		RETURNING group_id, user_id, status, role;
	`

	// Promote or demote member role (optional future feature)
	UPDATE_GROUP_MEMBER_ROLE = `
		UPDATE group_members
		SET role = ?, updated_at = CURRENT_TIMESTAMP
		WHERE group_id = ? AND user_id = ?
		RETURNING group_id, user_id, role;
	`

	UPDATE_GROUP_FOLLOWERS_COUNT = `
	INSERT INTO counters (entity_type, entity_id, followers_count)
	VALUES (?, ?, ?)
	ON CONFLICT(entity_type, entity_id)
	DO UPDATE SET
  	followers_count = counters.followers_count + excluded.followers_count,
	updated_at = CURRENT_TIMESTAMP;	
	`
)

// DELETE

const (
	// Delete a group
	DELETE_GROUP_BY_ID_AND_CREATOR = `
		DELETE FROM groups
		WHERE id = ? AND creator_id = ?
		RETURNING id;
	`

	// Remove a group member
	DELETE_GROUP_MEMBER = `
		DELETE FROM group_members
		WHERE group_id = ? AND user_id = ?
		RETURNING group_id, user_id;
	`

	// Delete an event
	DELETE_GROUP_EVENT = `
		DELETE FROM group_events
		WHERE id = ?
		RETURNING id;
	`
)
