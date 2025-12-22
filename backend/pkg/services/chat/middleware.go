package chat

import (
	"net/http"
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
