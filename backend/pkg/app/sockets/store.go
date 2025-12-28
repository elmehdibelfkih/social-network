package socket

import (
	"database/sql"

	"social/pkg/db/database"
	"social/pkg/utils"
)

// read
func SelectUserChats(c *Client) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(
			SELECT_USER_CHATS,
			c.userId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_USER_CHATS)
			return err
		}
		defer rows.Close()

		for rows.Next() {
			var chatId int64
			err = rows.Scan(&chatId)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_USER_CHATS)
				return err
			}
			c.userChats[chatId] = struct{}{}
		}
		return nil
	})
}

func SelectUserData(userId int64) (UserData, error) {
	var user UserData
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(
			SELECT_USER_BY_ID,
			userId,
		).Scan(
			&user.FirstName,
			&user.LastName,
			&user.Nickname,
			&user.DateOfBirth,
			&user.AvatarId,
			&user.AboutMe,
			&user.Privacy,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_USER_BY_ID)
			return err
		}
		return err
	})
	return user, err
}

func SelectChatParticipants(chatId int64) (map[int64]struct{}, error) {
	var userIds map[int64]struct{}
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(SELECT_CHAT_USERS, chatId)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_CHAT_USERS)
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var id int64
			err = rows.Scan(&id)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_CHAT_USERS)
				return err
			}
			userIds[id] = struct{}{}
		}
		return nil
	})
	return userIds, err
}

func SelectUserFollowers(userId int64) (*OnlineStatus, error) {
	var users OnlineStatus
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(SELECT_FOLLOWERS_BY_USER_ID, userId, userId, userId)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_FOLLOWERS_BY_USER_ID)
			return err
		}
		defer rows.Close()
		for rows.Next() {
			var u User
			err = rows.Scan(
				&u.UserId,
				&u.Nickname,
				&u.Email,
				&u.FirstName,
				&u.LastName,
				&u.DateOfBirth,
				&u.AvatarId,
				&u.AboutMe,
				&u.Privacy,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_FOLLOWERS_BY_USER_ID)
				return err
			}
			err = tx.QueryRow(
				SELECT_SHARED_CHAT,
				userId,
				u.UserId,
			).Scan(
				&u.ChatId,
				&u.Role,
				&u.UnreadCount,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_SHARED_CHAT)
				return err
			}
			users.OnlineUsers = append(users.OnlineUsers, u)
		}
		return nil
	})
	users.removeDuplicate()
	return &users, err
}

// func SelectChatParticipants(chatId int64) int64 {

// }

func UpdateMessagesStatus(chatId, senderId int64, status string) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(UPDATE_MESSAGE_STATUS,
			status,
			chatId,
			senderId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UPDATE_MESSAGE_STATUS)
			return err
		}
		defer rows.Close()

		for rows.Next() {
			var msg ChatMessage
			err = rows.Scan(
				&msg.MessageId,
				&msg.ChatId,
				&msg.SenderId,
				&msg.Content,
				&msg.SeenState,
				&msg.CreatedAt,
				&msg.UpdatedAt,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_MESSAGE_STATUS)
				return err
			}
			WSManger.BroadcastToChat(senderId, chatId, Event{
				Source: "server",
				Type:   "chat_seen",
				Payload: &ClientMessage{
					MarkSeen: &MarkSeen{
						MessageId: msg.MessageId,
						ChatId:    msg.ChatId,
						SenderId:  msg.SenderId,
						Content:   msg.Content,
						SeenState: msg.SeenState,
						CreatedAt: msg.CreatedAt,
						UpdatedAt: msg.UpdatedAt,
					},
				},
			})
		}
		return nil
	})
}

func InsertNotification(n Notification, actorId int64, tx *sql.Tx) error {
	var id int64
	var avatarId *int64
	var first string
	var last string
	err := tx.QueryRow(SELECT_ACTOR_BY_ID, actorId).Scan(&first, &last, &avatarId)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_ACTOR_BY_ID)
		return err
	}

	n.ActorId = actorId
	n.ActorName = first + " " + last
	n.ActorAvatarId = avatarId
	err = tx.QueryRow(SELECT_NOTIFCATION, n.UserId, n.Type, n.ReferenceType, n.ReferenceId).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		utils.SQLiteErrorTarget(err, SELECT_NOTIFCATION)
		return err
	}
	if id != 0 {
		n.NotificationId = id
	}
	err = tx.QueryRow(UPSERT_NOTIFICATION,
		n.NotificationId,
		n.ActorId,
		n.ActorName,
		n.ActorAvatarId,
		n.UserId,
		n.Type,
		n.ReferenceType,
		n.ReferenceId,
		n.Content,
		n.Status,
	).Scan(
		&n.NotificationId,
		&n.ActorId,
		&n.ActorName,
		&n.ActorAvatarId,
		&n.UserId,
		&n.Type,
		&n.ReferenceType,
		&n.ReferenceId,
		&n.Content,
		&n.Status,
		&n.IsRead,
		&n.CreatedAt,
		&n.ReadAt,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, UPSERT_NOTIFICATION)
		return err
	}

	WSManger.Notify(n)
	return nil
}
