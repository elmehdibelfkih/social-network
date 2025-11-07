package notifications

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"social/pkg/utils"
)

func canMarkNotifAsRead(r *http.Request) (bool, error) {
	userID := utils.GetUserIdFromContext(r)

	notifID := r.PathValue("id")
	notifID = strings.Trim(notifID, " ")
	if notifID == "" {
		return false, fmt.Errorf("invalid notification id")
	}

	notifIDInt, err := strconv.Atoi(notifID)
	if err != nil {
		return false, fmt.Errorf("invalid notification id")
	}

	ownerID := GetNotificationOwner(int64(notifIDInt))
	if ownerID == -1 {
		return false, nil
	}

	if ownerID == userID {
		return true, nil
	}

	return false, nil
}

func getNotifications(userID int64, page, limit int, readStatus, notifType string) ([]*Notification, error) {
	baseSelect := QUERY_GET_NOTIFICATION

	args := []any{}
	args = append(args, userID)

	whereParts := []string{}
	whereParts = append(whereParts, "user_id = ?")

	switch readStatus {
	case "read":
		whereParts = append(whereParts, "is_read = 1")
	case "unread":
		whereParts = append(whereParts, "is_read = 0")
	}

	if notifType != "" {
		whereParts = append(whereParts, "type = ?")
		args = append(args, notifType)
	}

	whereQuery := " WHERE " + strings.Join(whereParts, " AND ")
	listQuery := baseSelect + whereQuery + " ORDER BY created_at DESC LIMIT ? OFFSET ?;"

	offset := (page - 1) * limit
	args = append(args, limit, offset)

	notifs, err := ModularNotifisQuery(listQuery, args)
	if err != nil {
		return nil, err
	}

	return notifs, nil
}
