package chat

import (
	"context"
	"net/http"
	"strconv"
	"strings"
)

func ValidateChatIDMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		pathParts := strings.Split(r.URL.Path, "/")
		if len(pathParts) < 5 {
			http.Error(w, "Invalid URL", http.StatusBadRequest)
			return
		}

		chatId, err := strconv.ParseInt(pathParts[4], 10, 64)
		if err != nil || chatId <= 0 {
			http.Error(w, "Invalid chatId", http.StatusBadRequest)
			return
		}

		ctx := context.WithValue(r.Context(), "chatId", chatId)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}
