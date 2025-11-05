package groups

import (
	"database/sql"
	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"
)

// read

func SelectGroupById(groupId int64, g *GetGroupResponseJson) error {
	err := config.DB.QueryRow(SELECT_GROUP_WITH_MEMBER_COUNT,
		groupId,
	).Scan(
		&g.GroupId,
		&g.CreatorId,
		&g.Title,
		&g.Description,
		&g.MemberCount,
		&g.AvatarId,
		&g.CreatedAt,
		&g.UpdatedAt,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_GROUP_BY_OWNER)
	}
	return err
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

// write

//insert

func InsertNewGroup(cg *CreateGroupRequestJson, g *CreateGroupResponseJson, userId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(INSERT_GROUP_BY_USER_ID,
			utils.GenerateID(),
			userId,
			cg.Title,
			cg.Description,
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
			return err
		}
		return err
	})
}

func InsertNewGroupMember(groupId, userId int64, status, role string, m *InviteUserResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(INSERT_GROUP_MEMBER_BY_GROUP_ID,
			groupId,
			userId,
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

		return nil
	})
}

//update

func UpdateMemberStatus(groupId, userId int64, status string, a *AcceptMemberResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(UPDATE_GROUP_MEMBER_STATUS,
			groupId,
			userId,
			status,
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

		return nil
	})
}

func UpdateGroup(groupId, userId int64, u *UpdateGroupRequestJson, ur *UpdateGroupResponseJson) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		avatarId := utils.OptionalJsonFields(u.AvatarId)
		err := tx.QueryRow(UPDATE_GROUP_BY_ID,
			u.Title,
			u.Description,
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
			utils.SQLiteErrorTarget(err, UPDATE_GROUP_MEMBER_STATUS)
			return err
		}

		return nil
	})
}

//delete
