package chat

import (
	"database/sql"
	socket "social/pkg/app/sockets"
	"social/pkg/db/database"
	"social/pkg/utils"
)

func isGroupChat(chatId int64, tx *sql.Tx) (bool, error) {
	var groupId *int64
	err := tx.QueryRow(SELECT_CHAT_GROUP_ID, chatId).Scan(&groupId)
	if err != nil || groupId == nil {
		utils.SQLiteErrorTarget(err, SELECT_CHAT_GROUP_ID)
		return false, err
	}

	return true, nil
}

func InsertMessage(c *ChatMessage) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		c.SeenState = "sent"
		if socket.WSManger.ChatOnlineUsers(c.ChatId) > 1 {
			c.SeenState = "delivered"
			_, err := tx.Exec(
				UPDATE_MESSAGE_STATUS,
				c.SeenState,
				c.MessageId,
				c.ChatId,
				c.SenderId,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_MESSAGE_STATUS)
				return err
			}
		}
		err := tx.QueryRow(INSERT_MESSAGE,
			utils.GenerateID(),
			c.ChatId,
			c.SenderId,
			c.Content,
			c.SeenState,
		).Scan(
			&c.MessageId,
			&c.ChatId,
			&c.SenderId,
			&c.Content,
			&c.SeenState,
			&c.CreatedAt,
			&c.UpdatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_MESSAGE)
			return err
		}

		isGroup, err := isGroupChat(c.ChatId, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, "faild to get chat kind")
			return err
		}
		if !isGroup {
			_, err = tx.Exec(
				UPDATE_UNREAD_COUNT,
				c.ChatId,
				c.SenderId,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_UNREAD_COUNT)
				return err
			}
		}
		return nil
	})
}

func SelectChatById(chatId, userId int64) (bool, error) {
	var exist bool
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(
			SELECT_CHAT_MEMBER,
			chatId,
			userId,
		).Scan(&exist)
		return err
	})
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_CHAT_MEMBER)
		return exist, err
	}
	return exist, nil
}

func UpdateMessageStatus(s *MarkSeen) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		isGroup, err := isGroupChat(s.ChatId, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, "faild to get chat kind")
			return err
		}
		s.SeenState = "read"
		if isGroup {
			s.SeenState = "delivered"
		}
		_, err = tx.Exec(
			UPDATE_MESSAGE_STATUS,
			s.SeenState,
			s.MessageId,
			s.ChatId,
			s.SenderId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UPDATE_MESSAGE_STATUS)
			return err
		}
		return err
	})
}

func SelectChatMessages(userId, chatId, messageId int64, l *MessagesList) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		var count int
		limit := 20
		err := tx.QueryRow(SELECT_UNREAD_COUNT, userId).Scan(&count)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_UNREAD_COUNT)
			return err
		}
		_, err = tx.Exec(UPDATE_RESET_UNREAD_COUNT, userId)
		if err != nil {
			utils.SQLiteErrorTarget(err, UPDATE_RESET_UNREAD_COUNT)
			return err
		}
		if count > limit {
			limit = count
		}
		_, err = tx.Exec(UPDATE_MESSAGE_READ, chatId, userId, messageId, limit)
		if err != nil {
			utils.SQLiteErrorTarget(err, UPDATE_MESSAGE_READ)
			return err
		}
		var rows *sql.Rows
		if messageId > 0 {
			rows, err = tx.Query(SELECT_CHAT_HISTORY_BEFORE, chatId, messageId, limit)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_CHAT_HISTORY_BEFORE)
				return err
			}
		} else {
			rows, err = tx.Query(SELECT_CHAT_HISTORY, chatId, limit)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_CHAT_HISTORY)
				return err
			}
		}
		defer rows.Close()
		for rows.Next() {
			var msg ChatMessage
			err := rows.Scan(
				&msg.MessageId,
				&msg.ChatId,
				&msg.SenderId,
				&msg.Content,
				&msg.SeenState,
				&msg.CreatedAt,
				&msg.UpdatedAt,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_CHAT_HISTORY)
				return err
			}
			err = tx.QueryRow(
				SELECT_USER_BY_ID,
				msg.SenderId,
			).Scan(
				&msg.SenderData.FirstName,
				&msg.SenderData.LastName,
				&msg.SenderData.Nickname,
				&msg.SenderData.DateOfBirth,
				&msg.SenderData.AvatarId,
				&msg.SenderData.AboutMe,
				&msg.SenderData.Privacy,
			)
			socket.WSManger.BroadcastToChat(userId, chatId, socket.Event{
				Source: "server",
				Type:   "chat_seen",
				Payload: &socket.ClientMessage{
					MarkSeen: &socket.MarkSeen{
						MessageId: msg.MessageId,
						ChatId:    msg.ChatId,
						SenderId:  msg.SenderId,
						Content:   msg.Content,
						SenderData: socket.UserData(msg.SenderData),
						SeenState: msg.SeenState,
						CreatedAt: msg.CreatedAt,
						UpdatedAt: msg.UpdatedAt,
					},
				},
			})
			l.Messages = append(l.Messages, msg)
		}
		return nil
	})
}

func DeleteMessage(userId, chatId, messageId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(DELETE_MESSAGE,
			messageId,
			chatId,
			userId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, DELETE_MESSAGE)
			return err
		}
		return nil
	})
}
