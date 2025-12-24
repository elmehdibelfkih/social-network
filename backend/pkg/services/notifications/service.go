package notifications

import (
	"fmt"
	"math"
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

func getNotifications(userID int64, limit int, lastID int64) ([]*Notification, error) {
	baseSelect := QUERY_GET_NOTIFICATION

	args := []any{}
	args = append(args, userID)

	whereParts := []string{}
	whereParts = append(whereParts, "user_id = ?")

	if lastID == 0 {
		lastID = math.MaxInt64
	}
	whereParts = append(whereParts, "id < ?")
	args = append(args, lastID)

	whereQuery := " WHERE " + strings.Join(whereParts, " AND ")
	listQuery := baseSelect + whereQuery + " ORDER BY id DESC LIMIT ?;"

	args = append(args, limit)

	notifs, err := ModularNotifisQuery(listQuery, args)
	if err != nil {
		return nil, err
	}

	return notifs, nil
}
