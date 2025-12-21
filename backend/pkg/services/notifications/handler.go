package notifications

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"social/pkg/utils"
)

func HandleGetNotifications(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)

	limit, err := getIntQueryParam(r, "limit")
	if err != nil {
		utils.BadRequest(w, err.Error(), utils.ErrorTypeAlert)
		return
	}
	if limit > MAX_NUM_OF_NOTIFICATIONS || limit < 1 {
		utils.BadRequest(w, "limit parameter must be between 1 and "+strconv.Itoa(MAX_NUM_OF_NOTIFICATIONS), utils.ErrorTypeAlert)
		return
	}

	lastIDStr := r.URL.Query().Get("last_id")
	var lastID int64 = 0
	if lastIDStr != "" {
		lastID, err = strconv.ParseInt(lastIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid last_id parameter", utils.ErrorTypeAlert)
			return
		}
	}

	notifs, err := getNotifications(userID, limit, lastID)
	if err != nil {
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, NotificationsResponse{
		Limit:         limit,
		Notifications: notifs,
	})
}

func getIntQueryParam(r *http.Request, param string) (int, error) {
	paramValue := r.URL.Query().Get(param)
	if strings.Trim(paramValue, " ") == "" {
		return -1, fmt.Errorf("%s parameter can't be empty", param)
	}
	intParam, err := strconv.Atoi(paramValue)
	if err != nil {
		return -1, err
	}
	return intParam, nil
}

func HandleMarkNotifAsRead(w http.ResponseWriter, r *http.Request) {
	notifIDStr := r.PathValue("id")
	userID := utils.GetUserIdFromContext(r)

	notifID, err := strconv.Atoi(notifIDStr)
	if err != nil {
		utils.BadRequest(w, "Invalid notification ID.", utils.ErrorTypeAlert)
		return
	}

	err = MarkNotificationRead(userID, int64(notifID))
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
	if err != nil && err != sql.ErrNoRows {
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
