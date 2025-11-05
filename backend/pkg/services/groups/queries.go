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
	SELECT_GROUP_WITH_MEMBER_COUNT = `
		SELECT g.id, g.creator_id, g.title, g.description, g.avatar_media_id, 
		COUNT(m.user_id) AS member_count, g.created_at, g.updated_at
		FROM groups g
		LEFT JOIN group_members m ON g.id = m.group_id AND m.status = 'accepted'
		WHERE g.id = ?
		GROUP BY g.id;
	`

	// List all groups with pagination
	SELECT_BROWSE_GROUPS = `
		SELECT g.id, g.title, g.description, g.avatar_media_id, g.creator_id,
		COUNT(m.user_id) AS member_count, g.created_at
		FROM groups g
		LEFT JOIN group_members m ON g.id = m.group_id AND m.status = 'accepted'
		GROUP BY g.id
		ORDER BY g.created_at DESC
		LIMIT ? OFFSET ?;
	`

	// Count total groups (for pagination)
	SELECT_GROUPS_COUNT = `SELECT COUNT(*) FROM groups;`

	// Get members of a group with pagination
	SELECT_GROUP_MEMBERS_BY_GROUP_ID = `
		SELECT u.id AS user_id, u.first_name || ' ' || u.last_name AS full_name, 
		gm.role, gm.joined_at
		FROM group_members gm
		INNER JOIN users u ON u.id = gm.user_id
		WHERE gm.group_id = ? AND gm.status = 'accepted'
		ORDER BY gm.joined_at ASC
		LIMIT ? OFFSET ?;
	`

	// Count members in a group
	SELECT_GROUP_MEMBERS_COUNT = `
		SELECT COUNT(*) FROM group_members WHERE group_id = ? AND status = 'accepted';
	`

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
		VALUES (?, ?, ?)
		RETURNING group_id, user_id, status, role, created_at;
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
		WHERE group_id = ? AND user_id = ?
		RETURNING group_id, user_id, status, role;
	`

	// Promote or demote member role (optional future feature)
	UPDATE_GROUP_MEMBER_ROLE = `
		UPDATE group_members
		SET role = ?, updated_at = CURRENT_TIMESTAMP
		WHERE group_id = ? AND user_id = ?
		RETURNING group_id, user_id, role;
	`
)

// DELETE

const (
	// Delete a group
	DELETE_GROUP_BY_ID = `
		DELETE FROM groups
		WHERE id = ?
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
