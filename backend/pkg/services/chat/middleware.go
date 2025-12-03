package chat

import (
	"net/http"
	"social/pkg/config"
	"social/pkg/utils"
)

func ChatAccessMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		chatId := utils.GetWildCardValue(w, r, "chat_id")

		// Check if user is participant in the chat
		exist, err := SelectChatById(chatId, userId)
		if err != nil {
			utils.BackendErrorTarget(err, "ChatAccessMiddleware")
			utils.ForbiddenError(w, "Access denied")
			return
		}
		if !exist {
			utils.BackendErrorTarget(err, "ChatAccessMiddleware")
			utils.ForbiddenError(w, "Access denied")
			return
		}
		next(w, r)
	}
}

func FollowRelationshipMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		chatId := utils.GetWildCardValue(w, r, "chat_id")

		// Check if it's a group chat (allow all group messages)
		var isGroup bool
		err := config.DB.QueryRow("SELECT is_group FROM chats WHERE id = ?", chatId).Scan(&isGroup)
		if err != nil {
			utils.BackendErrorTarget(err, "FollowRelationshipMiddleware")
			utils.BadRequest(w, "Chat not found", "alert")
			return
		}

		if isGroup {
			next(w, r)
			return
		}

		// For private chats, check follow relationship
		var otherUserId int64
		err = config.DB.QueryRow(`
			SELECT user_id FROM chat_participants 
			WHERE chat_id = ? AND user_id != ? LIMIT 1
		`, chatId, userId).Scan(&otherUserId)
		if err != nil {
			utils.BackendErrorTarget(err, "FollowRelationshipMiddleware")
			utils.BadRequest(w, "Chat participant not found", "alert")
			return
		}

		// Check if at least one follows the other
		var followExists bool
		err = config.DB.QueryRow(`
			SELECT 1 FROM follows 
			WHERE (follower_id = ? AND followed_id = ? AND status = 'accepted') 
			   OR (follower_id = ? AND followed_id = ? AND status = 'accepted')
		`, userId, otherUserId, otherUserId, userId).Scan(&followExists)
		if err != nil {
			utils.ForbiddenError(w, "You can only message users you follow or who follow you")
			return
		}

		next(w, r)
	}
}
