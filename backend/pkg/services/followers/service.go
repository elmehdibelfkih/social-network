package follow

import (
	"net/http"
	socket "social/pkg/app/sockets"
	"social/pkg/db/database"
	"social/pkg/utils"
)

func followNotification(followerId, followedId int64, status string, notifStatus string) socket.Notification {
	var notification socket.Notification

	notification.NotificationId = utils.GenerateID()
	notification.UserId = followedId
	notification.Type = "follow_request"
	notification.RefrenceType = "user"
	notification.RefrenceId = followerId
	if status == "pending" {
		notification.Content = "New follow request received."
	} else {
		notification.Content = "New follower."
	}
	notification.Status = notifStatus
	return notification
}

func followUnfollowUpdateCounterStruct(entityType string, entityID int64, counterName string, action string) database.DBCounterSetter {
	var counter database.DBCounterSetter

	counter.CounterName = counterName
	counter.EntityType = entityType
	counter.EntityID = entityID
	counter.Action = action

	return counter
}

func followResponse(w http.ResponseWriter, r *http.Request, chatId int64) {

	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	var response FollowResponseJson
	status, err := selectFollowStatus(userId, targetUserId)
	if err != nil {
		utils.InternalServerError(w)
		return
	}
	switch status {
	case "pending":
		response.Message = "Follow request sent successfully."
	case "accepted":
		response.Message = "You are now following this user."
	}

	response.Status = status
	response.TargetUserId = targetUserId
	response.FollowerId = userId
	response.ChatId = &chatId
	if chatId == 0 {
		response.ChatId = nil
	}

	utils.WriteSuccess(w, http.StatusAccepted, response)

}

func unfollowResponse(w http.ResponseWriter, r *http.Request, chatId *int64) {

	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	var response FollowResponseJson

	response.Message = "Unfollow successful."
	response.TargetUserId = targetUserId
	response.FollowerId = userId
	response.ChatId = chatId

	utils.WriteSuccess(w, http.StatusAccepted, response)
}

func acceptFollowResponse(w http.ResponseWriter, r *http.Request, chatId int64) {
	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	var response AcceptFollowResponseJson

	response.Message = "Follow request accepted successfully."
	response.FollowerId = userId
	response.FollowedId = targetUserId
	response.Status = "accepted"
	response.ChatId = &chatId
	if chatId == 0 {
		response.ChatId = nil
	}

	utils.WriteSuccess(w, http.StatusAccepted, response)
}

func declineFollowResponse(w http.ResponseWriter, r *http.Request, chatId *int64) {
	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	var response AcceptFollowResponseJson

	response.Message = "Follow request declined successfully."
	response.FollowerId = userId
	response.FollowedId = targetUserId
	response.Status = "declined"
	response.ChatId = chatId

	utils.WriteSuccess(w, http.StatusAccepted, response)
}
