package media

import (
	"net/http"

	"social/pkg/utils"
)

func MediaMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)

		mediaId, err := getMediaID(r)
		if err != nil {
			utils.NotFoundError(w, "can't get the requested media")
		}

		if r.Method == http.MethodGet {
			if ok := canGetMedia(userId, mediaId); !ok {
				utils.Unauthorized(w, "don't have the permission to get this media")
				return
			}
		}
		if r.Method == http.MethodDelete {
			if ok := canDeleteMedia(userId, mediaId); !ok {
				utils.Unauthorized(w, "don't have the permission to delete this media")
				return
			}
		}
		next(w, r)
	}
}
