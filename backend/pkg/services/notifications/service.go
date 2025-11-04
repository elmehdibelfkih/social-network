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
