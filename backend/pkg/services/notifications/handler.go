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

	page, err := getIntQueryParam(r, "page")
	if err != nil || page < 1 {
		utils.BadRequest(w, err.Error(), utils.ErrorTypeAlert)
		return
	}

	limit, err := getIntQueryParam(r, "limit")
	if err != nil || limit != MAX_NUM_OF_NOTIFICATIONS {
		utils.BadRequest(w, err.Error(), utils.ErrorTypeAlert)
		return
	}

	readStatus := r.URL.Query().Get("read")
	if readStatus != "" && readStatus != "read" && readStatus != "unread" {
		utils.BadRequest(w, "Invalid 'read' parameter. Must be 'read' or 'unread'.", utils.ErrorTypeAlert)
		return
	}

	notifType := r.URL.Query().Get("type")
	if !validTypes[notifType] {
		utils.BadRequest(w, "invalid notification type", utils.ErrorTypeAlert)
		notifType = ""
	}

	notifs, err := getNotifications(userID, page, limit, readStatus, notifType)
	if err != nil {
		utils.InternalServerError(w)
		return
	}
	utils.WriteSuccess(w, http.StatusOK, PaginatedNotificationsResponse{
		Page:          page,
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
