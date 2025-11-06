package chat

import (
	"encoding/json"
	"net/http"
	"social/pkg/config"
	"social/pkg/utils"
	"strconv"
)

type ConversationsResponse struct {
	Chats []ConversationsList `json:"chats"`
}

func GetUserChats(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	if userId == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	chats, err := GetUserChatsFromDB(config.DB, userId)
	if err != nil {
		http.Error(w, "Failed to fetch chats: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := ConversationsResponse{Chats: chats}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// GET /api/v1/chats/{chat_id}/messages?page=1&limit=20
func GetmassageByPagination(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	if userId == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	chatId := utils.GetWildCardValue(w, r, "chat_id")
	if chatId == 0 {
		http.Error(w, "Invalid chatId", http.StatusBadRequest)
		return
	}

	queryParams := r.URL.Query()
	pageStr := queryParams.Get("page")
	limitStr := queryParams.Get("limit")

	page := 1
	limit := 20

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	messages, err := GetChatMessagesFromDB(config.DB, chatId, page, limit)
	if err != nil {
		http.Error(w, "Failed to fetch messages: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(messages); err != nil {
		http.Error(w, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func DeleteMessageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context
	userId := utils.GetUserIdFromContext(r)
	if userId == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get chat_id and message_id from URL path
	chatId := utils.GetWildCardValue(w, r, "chat_id")
	if chatId == 0 {
		http.Error(w, "Invalid chat ID", http.StatusBadRequest)
		return
	}

	messageId := utils.GetWildCardValue(w, r, "msg_id")
	if messageId == 0 {
		http.Error(w, "Invalid message ID", http.StatusBadRequest)
		return
	}

	// Delete the message
	err := DeleteMessage(config.DB, messageId, userId, chatId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Message deleted successfully.",
	})
}

func GetParticipantsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context
	userId := utils.GetUserIdFromContext(r)
	if userId == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get chat_id from URL path
	chatId := utils.GetWildCardValue(w, r, "chat_id")
	if chatId == 0 {
		http.Error(w, "Invalid chat ID", http.StatusBadRequest)
		return
	}

	// Get participants
	response, err := GetChatParticipants(config.DB, chatId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func SendMessageHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userId := utils.GetUserIdFromContext(r)
	if userId == 0 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	chatId := utils.GetWildCardValue(w, r, "chat_id")
	if chatId == 0 {
		http.Error(w, "Invalid chatId", http.StatusBadRequest)
		return
	}

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Text == "" {
		http.Error(w, "Text cannot be empty", http.StatusBadRequest)
		return
	}

	msg, err := InsertMessage(config.DB, chatId, userId, req.Text)
	if err != nil {
		http.Error(w, "Failed to send message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(msg)
}
