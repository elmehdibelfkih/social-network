package notifications

import (
	"net/http"

	"social/pkg/utils"
)

func NotifMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && r.URL.Path == "/mark-read" {
			ok, err := canMarkNotifAsRead(r)
			if err != nil {
				utils.BadRequest(w, err.Error(), utils.ErrorTypeAlert)
				return
			}
			if !ok {
				utils.Unauthorized(w, "can't mark the selected notification as read")
				return
			}
		}
		next(w, r)
	}
}
