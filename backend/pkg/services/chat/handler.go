package chat

import (
	"net/http"
	"social/pkg/config"
	"social/pkg/utils"
)

// GET /api/v1/chats
func GetUserChats(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)

	lastConversationId := utils.GetQuerryPramInt(r, "last-conversation-id")
	limit := int(utils.GetQuerryPramInt(r, "limit"))
	if limit == 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	chats, err := GetUserChatsFromDB(config.DB, userId, lastConversationId, limit)
	if err != nil {
		utils.BackendErrorTarget(err, "GetUserChats")
		utils.InternalServerError(w)
		return
	}

	utils.JsonResponseEncode(w, http.StatusOK, chats)
}

// GET /api/v1/chats/{chat_id}/messages
func GetmassageByPagination(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)

	chatId := utils.GetWildCardValue(w, r, "chat_id")

	lastMessageId := utils.GetQuerryPramInt(r, "last-message-id")
	limit := int(utils.GetQuerryPramInt(r, "limit"))
	if limit == 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	messages, err := GetChatMessagesFromDB(config.DB, chatId, userId, lastMessageId, limit)
	if err != nil {
		utils.BackendErrorTarget(err, "GetmassageByPagination")
		utils.InternalServerError(w)
		return
	}

	utils.JsonResponseEncode(w, http.StatusOK, messages)
}

// DELETE /api/v1/chats/{chat_id}/messages/{msg_id}
func DeleteMessageHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	chatId := utils.GetWildCardValue(w, r, "chat_id")
	messageId := utils.GetWildCardValue(w, r, "msg_id")

	err := DeleteMessage(config.DB, messageId, userId, chatId)
	if err != nil {
		utils.BackendErrorTarget(err, "DeleteMessageHandler")
		utils.BadRequest(w, "Message not found or unauthorized", "alert")
		return
	}

	// todo: use utils.JsonResponseEncode()
	utils.JsonResponseEncode(w, http.StatusOK, map[string]string{
		"message": "Message deleted successfully.",
	})
}

// GET /api/v1/chats/{chat_id}/participants
func GetParticipantsHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	chatId := utils.GetWildCardValue(w, r, "chat_id")

	participants, err := GetChatParticipants(config.DB, chatId, userId)
	if err != nil {
		utils.BackendErrorTarget(err, "GetParticipantsHandler")
		utils.InternalServerError(w)
		return
	}

	utils.JsonResponseEncode(w, http.StatusOK, participants)
}

// POST /api/v1/chats/{chat_id}/messages
func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	if userId == 0 {
		utils.Unauthorized(w, "Unauthorized")
		return
	}

	chatId := utils.GetWildCardValue(w, r, "chat_id")
	if chatId == 0 {
		return
	}

	var req SendMessageRequest
	if err := utils.JsonStaticDecode(r, &req); err != nil {
		utils.BackendErrorTarget(err, "SendMessageHandler")
		utils.BadRequest(w, "Invalid request body", "alert")
		return
	}

	if req.Text == "" {
		utils.BadRequest(w, "Text cannot be empty", "alert")
		return
	}

	msg, err := InsertMessage(config.DB, chatId, userId, req.Text)
	if err != nil {
		utils.BackendErrorTarget(err, "SendMessageHandler")
		utils.InternalServerError(w)
		return
	}

	utils.JsonResponseEncode(w, http.StatusOK, msg)
}
