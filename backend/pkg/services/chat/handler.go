package chat

import (
	"net/http"
	"social/pkg/utils"
)

// POST /api/v1/chats/{chat_id}/messages
func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	chatId := utils.GetWildCardValue(w, r, "chat_id")
	if chatId == 0 {
		return
	}
	var body ChatMessage
	if !utils.ValidateJsonRequest(w, r, &body, "SendMessageHandler") {
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	body.SenderId = userId
	err := InsertMessage(&body)
	if err != nil {
		utils.BackendErrorTarget(err, "SendMessageHandler")
		utils.IdentifySqlError(w, err)
		return
	}

	// ws braodcast here

	utils.WriteSuccess(w, http.StatusOK, body)

}

// PUT /api/v1/chats/{chat_id}/messages/{message_id}
func SeenMessageHandler(w http.ResponseWriter, r *http.Request) {
	var body MarkSeen
	if !utils.ValidateJsonRequest(w, r, &body, "SendMessageHandler") {
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}

	err := UpdateMessageStatus(&body)
	if err != nil {
		utils.BackendErrorTarget(err, "SendMessageHandler")
		utils.IdentifySqlError(w, err)
		return
	}

	// ws braodcast here

	utils.WriteSuccess(w, http.StatusOK, body)
}

// GET /api/v1/chats/{chat_id}/messages/{message_id}
func GetChatByPagination(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	chatId := utils.GetWildCardValue(w, r, "chat_id")
	messageId := utils.GetWildCardValue(w, r, "message_id")
	var response MessagesList

	err := SelectChatMessages(userId, chatId, messageId, &response)
	if err != nil {
		utils.BackendErrorTarget(err, "SendMessageHandler")
		utils.IdentifySqlError(w, err)
		return
	}

	utils.JsonResponseEncode(w, http.StatusOK, response)
}

// DELETE /api/v1/chats/{chat_id}/messages/{msg_id}
func DeleteMessageHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	chatId := utils.GetWildCardValue(w, r, "chat_id")
	messageId := utils.GetWildCardValue(w, r, "msg_id")

	err := DeleteMessage(userId, chatId, messageId)
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

// // GET /api/v1/chats
// func GetUserChats(w http.ResponseWriter, r *http.Request) {
// 	userId := utils.GetUserIdFromContext(r)

// 	lastConversationId := utils.GetQuerryPramInt(r, "last-conversation-id")
// 	limit := int(utils.GetQuerryPramInt(r, "limit"))
// 	if limit == 0 {
// 		limit = 20
// 	}
// 	if limit > 100 {
// 		limit = 100
// 	}

// 	chats, err := GetUserChatsFromDB(config.DB, userId, lastConversationId, limit)
// 	if err != nil {
// 		utils.BackendErrorTarget(err, "GetUserChats")
// 		utils.InternalServerError(w)
// 		return
// 	}

// 	utils.JsonResponseEncode(w, http.StatusOK, chats)
// }

// GET /api/v1/chats/{chat_id}/participants
// func GetParticipantsHandler(w http.ResponseWriter, r *http.Request) {
// 	userId := utils.GetUserIdFromContext(r)
// 	chatId := utils.GetWildCardValue(w, r, "chat_id")

// 	participants, err := GetChatParticipants(config.DB, chatId, userId)
// 	if err != nil {
// 		utils.BackendErrorTarget(err, "GetParticipantsHandler")
// 		utils.InternalServerError(w)
// 		return
// 	}
// 	utils.JsonResponseEncode(w, http.StatusOK, participants)
// }
