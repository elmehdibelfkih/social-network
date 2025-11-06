package follow

func followNotification(followerId, followedId int64, status string) Notification {
	var notification Notification

	notification.UserID = followedId
	notification.Type = "follow_request"
	notification.ReferenceType = "user"
	notification.ReferenceId = followerId
	if status == "pending" {
		notification.Content = "New follow request received."
	} else {
		notification.Content = "New follower."
	}
	notification.status = status
	return notification
}
