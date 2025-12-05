package chat

import (
	"social/pkg/utils"
	"strings"
)

// "POST", "/api/v1/chats/{chat_id}/messages"
type ChatMessage struct {
	MessageId int64  `json:"messageId"`
	ChatId    int64  `json:"chatId"`
	SenderId  int64  `json:"senderId"`
	Content   string `json:"content"`
	SeenState string `json:"seenState"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

// "PUT", "/api/v1/chats/{chat_id}/messages/{message_id}"

type MarkSeen struct {
	MessageId int64  `json:"messageId"`
	ChatId    int64  `json:"chatId"`
	SenderId  int64  `json:"senderId"`
	Content   string `json:"content"`
	SeenState string `json:"seenState"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

// "GET", "/api/v1/chats/{chat_id}/messages"

type MessagesList struct {
	Messages []ChatMessage `json:"messagesList"`
}

// "DELETE", "/api/v1/chats/{chat_id}/messages/{msg_id}"

type DeleteMessageRequest struct {
	MessageId int64  `json:"messageId"`
	ChatId    int64  `json:"chatId"`
	SenderId  int64  `json:"senderId"`
	Content   string `json:"content"`
	SeenState string `json:"seenState"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

// "GET", "/api/v1/chats",
// "GET", "/api/v1/chats/{chat_id}/participants"

func (v *ChatMessage) Validate() (bool, string) {
	if v.ChatId <= 0 {
		return false, "invalid chatId"
	}
	if v.SenderId <= 0 {
		return false, "invalid senderId"
	}
	if ok, str := utils.TextContentValidationEscape(&v.Content, 1, 4096); !ok {
		return false, str
	}

	// seen state validation
	validSeen := map[string]bool{
		"sent": true, "delivered": true, "seen": true,
	}
	if !validSeen[strings.ToLower(v.SeenState)] {
		return false, "invalid seenState"
	}

	return true, "OK"
}

func (v *MarkSeen) Validate() (bool, string) {
	if v.MessageId <= 0 {
		return false, "invalid messageId"
	}
	if v.ChatId <= 0 {
		return false, "invalid chatId"
	}
	if v.SenderId <= 0 {
		return false, "invalid senderId"
	}

	// SeenState must be correct
	validSeen := map[string]bool{
		"sent": true, "delivered": true, "seen": true,
	}
	if !validSeen[strings.ToLower(v.SeenState)] {
		return false, "invalid seenState"
	}
	return true, "OK"
}

func (v *MessagesList) Validate() (bool, string) {
	for _, msg := range v.Messages {
		if ok, str := msg.Validate(); !ok {
			return false, "invalid message in list: " + str
		}
	}
	return true, "OK"
}

func (v *DeleteMessageRequest) Validate() (bool, string) {
	if v.MessageId <= 0 {
		return false, "invalid messageId"
	}
	if v.ChatId <= 0 {
		return false, "invalid chatId"
	}
	if v.SenderId <= 0 {
		return false, "invalid senderId"
	}

	if ok, str := utils.TextContentValidationEscape(&v.Content, 0, 4096); !ok {
		return false, str
	}

	validSeen := map[string]bool{
		"sent": true, "delivered": true, "seen": true,
	}
	if !validSeen[strings.ToLower(v.SeenState)] {
		return false, "invalid seenState"
	}

	return true, "OK"
}
