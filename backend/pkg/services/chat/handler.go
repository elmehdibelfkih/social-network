package chat

import (
	"net/http"
	socket "social/pkg/app/sockets"
	"social/pkg/utils"
)

// POST /api/v1/chats/{chat_id}/messages
func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
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
	socket.WSManger.BroadcastToChat(userId, body.ChatId, socket.Event{
		Source: "server",
		Type:   "chat_message",
		Payload: &socket.ClientMessage{
			ChatMessage: &socket.ChatMessage{
				MessageId: body.MessageId,
				ChatId:    body.ChatId,
				SenderId:  body.SenderId,
				Content:   body.Content,
				SeenState: body.SeenState,
				CreatedAt: body.CreatedAt,
				UpdatedAt: body.UpdatedAt,
			},
		},
	})

	utils.WriteSuccess(w, http.StatusOK, body)

}

// PUT /api/v1/chats/{chat_id}/messages/{message_id}
func SeenMessageHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	var body MarkSeen
	if !utils.ValidateJsonRequest(w, r, &body, "SendMessageHandler") {
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	body.SenderId = userId
	err := UpdateMessageStatus(&body)
	if err != nil {
		utils.BackendErrorTarget(err, "SendMessageHandler")
		utils.IdentifySqlError(w, err)
		return
	}

	// ws braodcast here
	socket.WSManger.BroadcastToChat(userId, body.ChatId, socket.Event{
		Source: "server",
		Type:   "chat_seen",
		Payload: &socket.ClientMessage{
			MarkSeen: &socket.MarkSeen{
				MessageId: body.MessageId,
				ChatId:    body.ChatId,
				SenderId:  body.SenderId,
				Content:   body.Content,
				SeenState: body.SeenState,
				CreatedAt: body.CreatedAt,
				UpdatedAt: body.UpdatedAt,
			},
		},
	})

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
		utils.BackendErrorTarget(err, "GetChatByPagination")
		utils.IdentifySqlError(w, err)
		return
	}


	utils.WriteSuccess(w, http.StatusOK, response)
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
	utils.WriteSuccess(w, http.StatusOK, map[string]string{
		"message": "Message deleted successfully.",
	})
}

