package chat

import (
	"database/sql"
	"fmt"
	"time"
)

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

func GetChatMessagesFromDB(db *sql.DB, chatId int64, page, limit int) (*PaginatedMessagesResponse, error) {
	offset := (page - 1) * limit

	query := GetmassageByP

	rows, err := db.Query(query, chatId, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messages := []Message{}

	for rows.Next() {
		var msg Message

		err := rows.Scan(
			&msg.MessageID,
			&msg.SenderID,
			&msg.Text,
			&msg.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		messages = append(messages, msg)
	}

	response := &PaginatedMessagesResponse{
		ChatID:   chatId,
		Page:     page,
		Limit:    limit,
		Messages: messages,
	}

	return response, nil
}
func DeleteMessage(db *sql.DB, messageId, userId, chatId int64) error {
	var exists bool
	err := db.QueryRow(checkMessageOwnershipQuery, messageId, userId, chatId).Scan(&exists)
	if err == sql.ErrNoRows {
		return fmt.Errorf("message not found or you don't have permission to delete it")
	}
	if err != nil {
		return fmt.Errorf("failed to check message ownership: %v", err)
	}

	result, err := db.Exec(deleteMessageQuery, messageId, userId)
	if err != nil {
		return fmt.Errorf("failed to delete message: %v", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error checking affected rows: %v", err)
	}
	if affected == 0 {
		return fmt.Errorf("message not found or already deleted")
	}

	return nil
}

func GetChatParticipants(db *sql.DB, chatId int64) (*ParticipantsResponse, error) {
	rows, err := db.Query(getParticipantsQuery, chatId)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch participants: %v", err)
	}
	defer rows.Close()

	participants := []ChatParticipant{}
	for rows.Next() {
		var p ChatParticipant
		err := rows.Scan(
			&p.UserID,
			&p.Username,
			&p.Role,
			&p.LastSeenMessageID,
			&p.UnreadCount,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan participant: %v", err)
		}
		participants = append(participants, p)
	}

	return &ParticipantsResponse{
		ChatID:       chatId,
		Participants: participants,
	}, nil
}

func InsertMessage(db *sql.DB, chatId, senderId int64, text string) (*SendMessageResponse, error) {
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var exists bool
	err = tx.QueryRow(checkChatParticipantQuery, chatId, senderId).Scan(&exists)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user is not a participant in this chat")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to check chat participation: %v", err)
	}

	_, err = tx.Exec(insertMessageQuery, chatId, senderId, text)
	if err != nil {
		return nil, err
	}

	var messageId int64
	err = tx.QueryRow(getLastInsertedMessageID).Scan(&messageId)
	if err != nil {
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	response := &SendMessageResponse{
		MessageID: messageId,
		ChatID:    chatId,
		SenderID:  senderId,
		Text:      text,
		CreatedAt: time.Now().UTC().Format("2006-01-02T15:04:05Z"),
	}

	return response, nil
}
