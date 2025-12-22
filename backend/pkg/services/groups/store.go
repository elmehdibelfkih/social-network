package groups

import (
	"database/sql"
	"math"
	"strings"

	socket "social/pkg/app/sockets"
	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"
)

// read
func SelectGroupMembers(groupId, limit, lastItemId int64, l *ListGroupMembersResponseJson) error {
	if lastItemId == 0 {
		lastItemId = math.MaxInt64
	}
	rows, err := config.DB.Query(SELECT_GROUP_MEMBERS_BY_GROUP_ID,
		groupId,
		lastItemId,
		limit,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_GROUP_MEMBERS_BY_GROUP_ID)
		return err
	}
	defer rows.Close()
	l.Limit = limit
	var item GroupMemberJson
	var first string
	var last string
	for rows.Next() {
		err = rows.Scan(
			&item.UserId,
			&first,
			&last,
			&item.Role,
			&item.JoinedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_GROUP_MEMBERS_BY_GROUP_ID)
			return err
		}
		item.FullName = strings.Join([]string{first, last}, " ")
		l.Members = append(l.Members, item)
	}
	return err
}

func SelectGroupsById(limit, lastItemId int64, l *BrowseGroupsResponseJson) error {
	if lastItemId == 0 {
		lastItemId = math.MaxInt64
	}
	rows, err := config.DB.Query(SELECT_BROWSE_GROUPS,
		lastItemId,
		limit,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_BROWSE_GROUPS)
		return err
	}
	defer rows.Close()
	l.Limit = limit
	var item GroupItemJson
	for rows.Next() {
		err = rows.Scan(
			&item.GroupId,
			&item.Title,
			&item.Description,
			&item.AvatarId,
			&item.CreatorId,
			&item.CreatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_BROWSE_GROUPS)
			return err
		}
		err = config.DB.QueryRow(SELECT_GROUP_MEMBERS_COUNT,
			"group",
			item.GroupId,
		).Scan(
			&item.MemberCount,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				item.MemberCount = 0
			} else {
				utils.SQLiteErrorTarget(err, SELECT_GROUP_MEMBERS_COUNT)
				return err
			}
		}
		l.TotalGroups++
		l.Groups = append(l.Groups, item)
	}
	return err
}

func SelectGroupById(groupId int64, g *GetGroupResponseJson) error {
	err := config.DB.QueryRow(SELECT_GROUP_BY_GROUP_ID,
		groupId,
	).Scan(
		&g.GroupId,
		&g.CreatorId,
		&g.Title,
		&g.Description,
		&g.AvatarId,
		&g.CreatedAt,
		&g.UpdatedAt,
		&g.Status,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_GROUP_BY_GROUP_ID)
		return err
	}
	err = config.DB.QueryRow(SELECT_GROUP_MEMBERS_COUNT,
		"group",
		groupId,
	).Scan(
		&g.MemberCount,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			g.MemberCount = 0
		} else {
			utils.SQLiteErrorTarget(err, SELECT_GROUP_MEMBERS_COUNT)
			return err
		}
	}
	return err
}

func SelectGroupMember(groupId, userId int64) (bool, error) {
	var exist bool
	err := config.DB.QueryRow(SELECT_GROUP_MEMBER_BY_ID,
		groupId,
		userId,
	).Scan(&exist)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_GROUP_MEMBER_BY_ID)
	}
	return exist, err
}

func SelectGroupAcceptedMember(groupId, userId int64) (bool, error) {
	var exist bool
	err := config.DB.QueryRow(SELECT_GROUP_MEMBER_ACCEPTED,
		groupId,
		userId,
	).Scan(&exist)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_GROUP_MEMBER_ACCEPTED)
	}
	return exist, err
}

func SelectGroupOwner(groupId, userId int64) (bool, error) {
	var exist bool
	err := config.DB.QueryRow(SELECT_GROUP_BY_OWNER,
		groupId,
		userId,
	).Scan(
		&exist,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_GROUP_BY_OWNER)
	}
	return exist, err
}

func SelectGoupMemberPending(groupId, userId int64) (bool, error) {
	var exist bool
	err := config.DB.QueryRow(SELECT_GROUP_MEMBER_PENDING,
		groupId,
		userId,
	).Scan(
		&exist,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_GROUP_MEMBER_PENDING)
	}
	return exist, err
}

func SelectFollows(follower, followed int64) (bool, error) {
	var exist bool
	err := config.DB.QueryRow(SELECT_FOLLOWS_BY_ID,
		follower,
		followed,
	).Scan(
		&exist,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_FOLLOWS_BY_ID)
	}
	return exist, err
}

func SelectGoupEvent(groupId, eventId, userId int64, e *GetEventResponseJson) error {
	err := config.DB.QueryRow(SELECT_EVENT_BY_ID,
		eventId,
		groupId,
		userId,
	).Scan(
		&e.EventId,
		&e.GroupId,
		&e.Title,
		&e.Description,
		&e.Location,
		&e.StartAt,
		&e.EndAt,
		&e.CreatedAt,
		&e.CreatedBy.UserId,
		&e.CreatedBy.Username,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_EVENT_BY_ID)
	}
	return err
}

func SelectAllGoupEvent(groupId int64, l *ListEventsResponseJson) error {
	rows, err := config.DB.Query(SELECT_EVENTS_BY_GROUP_ID, groupId)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_EVENTS_BY_GROUP_ID)
	}
	defer rows.Close()
	l.GroupId = groupId
	var e EventItemJson
	for rows.Next() {
		err = rows.Scan(
			&e.EventId,
			&e.CreatedBy,
			&e.Title,
			&e.Description,
			&e.Location,
			&e.StartAt,
			&e.EndAt,
			&e.CreatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_EVENTS_BY_GROUP_ID)
			return err
		}
		l.Events = append(l.Events, e)
	}
	return err
}

// insert
func InsertNewGroup(cg *CreateGroupRequestJson, g *CreateGroupResponseJson, userId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(INSERT_GROUP_BY_USER_ID,
			utils.GenerateID(),
			userId,
			strings.TrimSpace(cg.Title),
			strings.TrimSpace(cg.Description),
			cg.AvatarId,
		).Scan(
			&g.GroupId,
			&g.CreatorId,
			&g.Title,
			&g.Description,
			&g.AvatarId,
			&g.CreatedAt,
			&g.UpdatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_GROUP_BY_USER_ID)
		}
		return err
	})
}

func InsertNewGroupOwner(groupId, userId int64, status, role string) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(INSERT_GROUP_MEMBER_BY_GROUP_ID,
			groupId,
			userId,
			status,
			role,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_GROUP_MEMBER_BY_GROUP_ID)
			return err
		}

		if status == "accepted" {
			counter := addRemoveMemberUpdateCounterStruct(database.GROUP_ENTITY_TYPE, groupId, database.FOLLOWERS_ENTITY_NAME, database.ACTION_INCREMENT)
			err = database.UpdateCounter(tx, counter)
			if err != nil {
				utils.SQLiteErrorTarget(err, database.GROUP_ENTITY_TYPE)
				return err
			}
		}

		return nil
	})
}

func InsertNewGroupMember(targetId, groupId int64, status, role, notificationType string, m *InviteUserResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(INSERT_GROUP_MEMBER_BY_GROUP_ID,
			groupId,
			targetId,
			status,
			role,
		).Scan(
			&m.GroupId,
			&m.InvitedUserId,
			&m.Status,
			&m.CreatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_GROUP_MEMBER_BY_GROUP_ID)
			return err
		}
		if notificationType == "group_join" {
			err = tx.QueryRow(
				SELECT_GROUP_OWNER,
				groupId,
			).Scan(
				&targetId,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, INSERT_GROUP_MEMBER_BY_GROUP_ID)
				return err
			}
		}
		socket.InsertNotification(socket.Notification{
			NotificationId: utils.GenerateID(),
			UserId:         targetId,
			Type:           notificationType,
			RefrenceId:     groupId,
			RefrenceType:   "group",
			Content:        "you have been invated to group",
			Status:         "active",
		}, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_NOTIFICATION)
		}
		return err
	})
}

func insertNewGroupEvent(userId, groupId int64, e *CreateEventRequestJson, er *CreateEventResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(
			INSERT_GROUP_EVENT,
			utils.GenerateID(),
			groupId,
			userId,
			e.Title,
			e.Description,
			e.Location,
			e.StartAt,
			e.EndAt,
		).Scan(
			&er.EventId,
			&er.GroupId,
			&er.Title,
			&er.Description,
			&er.StartAt,
			&er.EndAt,
			&er.Location,
			&er.CreatedBy,
			&er.CreatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_GROUP_EVENT)
			return err
		}
		rows, err := tx.Query(
			SELECT_GROUP_MEMBERS_BY_GROUP,
			groupId,
			userId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_GROUP_MEMBERS_BY_GROUP)
			return err
		}
		defer rows.Close()
		var groupUser int64
		for rows.Next() {
			err = rows.Scan(
				&groupUser,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, INSERT_NOTIFICATION)
			}
			socket.InsertNotification(socket.Notification{
				NotificationId: utils.GenerateID(),
				UserId:         groupUser,
				Type:           "event_created",
				RefrenceId:     er.EventId,
				RefrenceType:   "event",
				Content:        "An event has been created",
				Status:         "active",
			}, tx)
			if err != nil {
				utils.SQLiteErrorTarget(err, INSERT_NOTIFICATION)
			}
		}
		return err
	})
}

// update
func UpdateMemberStatusAccepted(groupId, userId int64, a *AcceptMemberResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(UPDATE_GROUP_MEMBER_STATUS,
			"accepted",
			groupId,
			userId,
		).Scan(
			&a.GroupId,
			&a.UserId,
			&a.Status,
			&a.Role,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UPDATE_GROUP_MEMBER_STATUS)
			return err
		}

		counter := addRemoveMemberUpdateCounterStruct(database.GROUP_ENTITY_TYPE, groupId, database.FOLLOWERS_ENTITY_NAME, database.ACTION_INCREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.GROUP_ENTITY_TYPE)
			return err
		}

		return nil
	})
}

func UpdateMemberStatusDeclined(groupId, userId int64, d *DeclineMemberResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(UPDATE_GROUP_MEMBER_STATUS,
			groupId,
			userId,
			"declined",
		).Scan(
			&d.GroupId,
			&d.UserId,
			&d.Status,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UPDATE_GROUP_MEMBER_STATUS)
		}
		return err
	})
}

func UpdateGroup(groupId, userId int64, u *UpdateGroupRequestJson, ur *UpdateGroupResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		avatarId := utils.OptionalJsonFields(u.AvatarId)
		err := tx.QueryRow(UPDATE_GROUP_BY_ID,
			strings.TrimSpace(u.Title),
			strings.TrimSpace(u.Description),
			avatarId,
			groupId,
		).Scan(
			&ur.GroupId,
			&ur.Title,
			&ur.Description,
			&ur.AvatarId,
			&ur.UpdatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UPDATE_GROUP_BY_ID)
		}
		return err
	})
}

func UpdateMetaData(entityType string, entityId int64, value int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(UPDATE_GROUP_FOLLOWERS_COUNT,
			entityType,
			entityId,
			value,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UPDATE_GROUP_FOLLOWERS_COUNT)
		}
		return err
	})
}

func UpdateRsvp(eventId, userId int64, r *RSVPRequestJson, rs *RSVPResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(INSERT_EVENT_RSVP,
			eventId,
			userId,
			r.Option,
		)
		rs.Message = "RSVP updated successfully."
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_EVENT_RSVP)
		}
		return err
	})
}

func SelectRsvp(eventId, userId int64, rs *GetRSVPResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(COUNT_EVENT_RSVP_COUNTS, eventId).Scan(&rs.Countgoing, &rs.CountNotgoing)
		if err != nil {
			utils.SQLiteErrorTarget(err, COUNT_EVENT_RSVP_COUNTS)
		}
		var userResponse sql.NullString
		err = tx.QueryRow(GET_USER_RSVP, eventId, userId).Scan(&userResponse)
		if err != nil && err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, GET_USER_RSVP)
			return err
		}
		rs.Amigoing = userResponse.Valid && userResponse.String == "going"
		return nil
		
	})
}

// delete
func DeleteGroupMember(groupId, userId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		var isMember bool
		err := tx.QueryRow(SELECT_GROUP_MEMBER_ACCEPTED, groupId, userId).Scan(&isMember)
		if err != nil {
			utils.SQLiteErrorTarget(err, "SELECT group_member status")
			return err
		}

		_, err = tx.Exec(DELETE_GROUP_MEMBER, groupId, userId)
		if err != nil {
			utils.SQLiteErrorTarget(err, DELETE_GROUP_MEMBER)
			return err
		}

		if isMember {
			counter := addRemoveMemberUpdateCounterStruct(database.GROUP_ENTITY_TYPE, groupId, database.FOLLOWERS_ENTITY_NAME, database.ACTION_DECREMENT)
			err = database.UpdateCounter(tx, counter)
			if err != nil {
				utils.SQLiteErrorTarget(err, database.GROUP_ENTITY_TYPE)
				return err
			}
		}

		return nil
	})
}

func DeleteGroupFromGroups(groupId, userId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(
			DELETE_GROUP_BY_ID_AND_CREATOR,
			groupId,
			userId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, DELETE_GROUP_BY_ID_AND_CREATOR)
		}
		return err
	})
}
