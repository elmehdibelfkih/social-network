package media

import (
	"net/http"

	"social/pkg/config"
	"social/pkg/utils"
)

func MediaMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(config.USER_ID_KEY).(int64)
		if !ok {
			utils.Unauthorized(w, "Invalid user")
		}

		mediaID, err := getMediaID(r)
		if err != nil {
			utils.NotFoundError(w, "can't get the requested media")
		}

		if r.Method == http.MethodGet {
			if ok := canGetMedia(userID, mediaID); !ok {
				utils.Unauthorized(w, "don't have the permission to get this media")
				return
			}
		}
		if r.Method == http.MethodDelete {
			if ok := canDeleteMedia(userID, mediaID); !ok {
				utils.Unauthorized(w, "don't have the permission to delete this media")
				return
			}
		}
		next(w, r)
	}
}
