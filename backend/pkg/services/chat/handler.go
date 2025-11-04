package chat

import (
	"encoding/json"
	"net/http"
	"social/pkg/config"
	"social/pkg/utils"
)

// GetUserChatsFromDB fetches all chats for a user

type ConversationsResponse struct {
	Chats []ConversationsList `json:"chats"`
}

// func GetUserChatsHandler(db *sql.DB) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		userId := utils.GetUserIdFromContext(r)
// 		if userId == 0 {
// 			http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 			return
// 		}

// 		chats, err := GetUserChatsFromDB(db, userId)
// 		if err != nil {
// 			http.Error(w, "Failed to fetch chats: "+err.Error(), http.StatusInternalServerError)
// 			return
// 		}

// 		resp := ConversationsResponse{Chats: chats}
// 		w.Header().Set("Content-Type", "application/json")
// 		w.WriteHeader(http.StatusOK)
// 		json.NewEncoder(w).Encode(resp) // exactly matches your JSON structure
// 	}
// }

// GetUserChats is exported handler compatible with the project's route registration style.
// It uses the global DB from config package.
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
