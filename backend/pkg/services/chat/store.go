package chat

import "database/sql"

func GetUserChatsFromDB(db *sql.DB, userId int64) ([]ConversationsList, error) {
	rows, err := db.Query(GetUserChatsQuery, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	chats := []ConversationsList{}

	for rows.Next() {
		var chat ConversationsList
		var lastMsgId sql.NullInt64
		var lastMsgText sql.NullString
		var lastMsgCreated sql.NullString
		var updatedAt sql.NullString

		err := rows.Scan(
			&chat.ChatId,
			&chat.Name,
			&lastMsgId,
			&lastMsgText,
			&lastMsgCreated,
			&chat.UnreadCount,
			&updatedAt,
		)
		if err != nil {
			return nil, err
		}

		chat.GroupId = nil

		if lastMsgId.Valid {
			chat.LastMessage = lastMessage{
				Id:        lastMsgId.Int64,
				Text:      lastMsgText.String,
				CreatedAt: lastMsgCreated.String,
			}
		} else {
			chat.LastMessage = lastMessage{}
		}

		if updatedAt.Valid {
			chat.UpdatedAt = updatedAt.String
		} else {
			chat.UpdatedAt = ""
		}

		chats = append(chats, chat)
	}

	return chats, nil
}
