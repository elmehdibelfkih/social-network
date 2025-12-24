package groups

// SELECT

const (
	SELECT_GROUP_CHAT_ID = `
		SELECT id FROM chats WHERE group_id = ?
	`

	SELECT_GROUP_OWNER = `
		SELECT creator_id FROM groups WHERE id = ?
	`
	SELECT_GROUP_BY_GROUP_ID = `
		SELECT g.id, g.creator_id, g.title, g.description, g.avatar_id, g.created_at, g.updated_at, gm.status
		FROM groups g
		LEFT JOIN group_members gm
		ON g.id = gm.group_id
		WHERE id = ?;
	`
	SELECT_FOLLOWS_BY_ID = `
		SELECT EXISTS (
			SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ?
		);
	`
	SELECT_GROUP_BY_OWNER = `
		SELECT EXISTS (
			SELECT 1 FROM groups WHERE id = ? AND creator_id = ?
		);
	`
	SELECT_GROUP_MEMBER_BY_ID = `
		SELECT EXISTS (
			SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND status IN ('pending', 'accepted')
		);
	`
	SELECT_GROUP_MEMBER_ACCEPTED = `
		SELECT EXISTS (
			SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'accepted'
		);
	`
	SELECT_GROUP_MEMBER_PENDING = `
		SELECT EXISTS (
			SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'pending'
		);
	`
	SELECT_GROUP_MEMBERS_COUNT = `
		SELECT followers_count FROM counters WHERE entity_type = ? AND entity_id = ?
	`

	SELECT_BROWSE_GROUPS = `
		SELECT id, title, description, avatar_id, creator_id, created_at
		FROM groups
		WHERE id < ?
		ORDER BY created_at DESC
		LIMIT ?
	`
	SELECT_BROWSE_GROUPS_BY_USER = `
		SELECT g.id, g.title, g.description, g.avatar_id, g.creator_id, g.created_at
		FROM group_members gm
		JOIN groups g ON g.id = gm.group_id
		WHERE gm.user_id = ?
  			AND gm.status = 'accepted'
		ORDER BY gm.joined_at DESC
		LIMIT ? OFFSET ?
	`

	SELECT_BROWSE_OTHER_GROUPS_BY_USER = `
		SELECT g.id, g.title, g.description, g.avatar_id, g.creator_id, g.created_at
		FROM groups g
		LEFT JOIN group_members gm
  			ON gm.group_id = g.id
  			AND gm.user_id = ?
  			AND gm.status = 'accepted'
			WHERE gm.user_id IS NULL
		ORDER BY g.created_at DESC
		LIMIT ? OFFSET ?
	`

	SELECT_GROUP_MEMBERS_BY_GROUP_ID = `
	SELECT 
    gm.user_id, u.first_name, u.last_name, gm.role, gm.joined_at
	FROM group_members AS gm
	JOIN users AS u ON gm.user_id = u.id
	WHERE group_id = ? AND status = 'accepted'
	ORDER BY gm.created_at DESC
	LIMIT ?
	`
	SELECT_GROUP_MEMBERS_BY_GROUP = `
	SELECT user_id
	FROM group_members
	WHERE group_id = ? AND user_id <> ? AND status = 'accepted' 
	`

	SELECT_EVENT_BY_ID = `
		SELECT 
		ge.id, ge.group_id, ge.creator_id, ge.title, ge.description, ge.location, ge.start_at, ge.end_at, ge.created_at,
		u.first_name, u.last_name
		FROM group_events AS ge
		JOIN users AS u
    	ON ge.creator_id = u.id
		WHERE ge.id = ? AND ge.group_id = ? AND u.id = ?;
	`

	SELECT_EVENTS_BY_GROUP_ID = `
		SELECT id, creator_id, title, description, location, start_at, end_at, created_at
		FROM group_events
		WHERE group_id = ?
		ORDER BY created_at ASC;
	`

	COUNT_EVENT_RSVP_COUNTS = `
			SELECT
				SUM(CASE WHEN response = 'going' THEN 1 ELSE 0 END) AS going_count,
				SUM(CASE WHEN response = 'not_going' THEN 1 ELSE 0 END) AS not_going_count
			FROM group_event_responses
			WHERE event_id = ?;
		`

	GET_USER_RSVP = `
			SELECT response
			FROM group_event_responses
			WHERE event_id = ? AND user_id = ?;
		`
)

// INSERT

const (
	INSERT_GROUP_CHAT_MEMBER=`
		INSERT INTO chat_participants (chat_id, user_id)
		VALUES (?,?)
	`


	INSERT_GROUP_CHAT_ID = `
	INSERT INTO chats (id, group_id, title)
	VALUES (?, ?, ?)
	RETURNING id;
	`
	INSERT_GROUP_BY_USER_ID = `
		INSERT INTO groups (id, creator_id, title, description, avatar_id)
		VALUES (?, ?, ?, ?, ?)
		RETURNING id, creator_id, title, description, avatar_id, created_at, updated_at;
	`
	INSERT_GROUP_MEMBER_BY_GROUP_ID = `
		INSERT INTO group_members (group_id, user_id, status, role)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(group_id, user_id)
		DO UPDATE SET  status = excluded.status, role = excluded.role, updated_at = CURRENT_TIMESTAMP	
		RETURNING group_id, user_id, status, created_at;
	`

	INSERT_GROUP_EVENT = `
		INSERT INTO group_events (id, group_id, creator_id, title, description, location, start_at, end_at )
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id, group_id, title, description, start_at, end_at, location, creator_id, created_at;
	`

	// INSERT_EVENT_RSVP = `
	// 	INSERT INTO event_rsvps (event_id, user_id, option)
	// 	VALUES (?, ?, ?)
	// 	ON CONFLICT(event_id, user_id)
	// 	DO UPDATE SET option = excluded.option;
	// `

	INSERT_EVENT_RSVP = `
	INSERT INTO group_event_responses (event_id, user_id, response)
	VALUES (?, ?, ?)
	ON CONFLICT (event_id, user_id)
	DO UPDATE SET
		response = excluded.response,
		responded_at = CURRENT_TIMESTAMP;
	`

	INSERT_NOTIFICATION = `
	INSERT INTO notifications (id, user_id, type, reference_type, reference_id, content) 
	VALUES (?, ?, ?, ?, ?, ?)
	`
)

// UPDATE

const (
	UPDATE_GROUP_BY_ID = `
		UPDATE groups
		SET title = ?, description = ?, avatar_id = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
		RETURNING id, title, description, avatar_id, updated_at;
	`

	UPDATE_GROUP_MEMBER_STATUS = `
		UPDATE group_members
		SET status = ?, updated_at = CURRENT_TIMESTAMP
		WHERE group_id = ? AND user_id = ? AND status = 'pending'
		RETURNING group_id, user_id, status, role;
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
