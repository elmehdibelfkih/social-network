package notifications

import (
	"database/sql"
	"net/http"
	"strconv"

	"social/pkg/utils"
)

func HandleMarkNotifAsRead(w http.ResponseWriter, r *http.Request) {
	notifIDStr := r.PathValue("id")
	userID := utils.GetUserIdFromContext(r)

	notifID, _ := strconv.Atoi(notifIDStr)
	err := MarkNotificationRead(userID, int64(notifID))
	if err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "There's No Such Notification")
			return
		}
		utils.InternalServerError(w)
		return
	}
	utils.WriteSuccess(w, http.StatusOK, map[string]string{"message": "Notification marked as read."})
}

func HandleMarkAllNotifAsRead(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)

	err := MarkAllNotificationsRead(userID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "There's Notifications to mark as read")
			return
		}
		utils.InternalServerError(w)
		return
	}
	utils.WriteSuccess(w, http.StatusOK, map[string]string{"message": "All notifications marked as read."})
}

func HandleGetUnreadCount(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)

	count, err := GetUnreadCount(userID)
	if err != nil {
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, map[string]int{"unreadCount": count})
}
