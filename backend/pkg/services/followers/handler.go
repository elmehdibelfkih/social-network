package follow

import (
	"net/http"
	"social/pkg/utils"
)

// POST /api/v1/users/:user_id/follow => send follow request or follow immediately if target is public
// todo: creat chat table if not exist
func FollowHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	err := followUser(userId, targetUserId)
	if err != nil {
		utils.IdentifySqlError(w, err)
		return
	}
	err = createChatId(userId, targetUserId)
	if err != nil {
		utils.IdentifySqlError(w, err)
		return
	}
	followResponse(w, r)
	// todo: check notNound and supper flous error in localhost:8080/api/v1/users/:user_id/follow and similar
}

// POST /api/v1/users/:user_id/unfollow => unfollow
func UnfollowHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	err := unfollowUser(userId, targetUserId)
	if err != nil {
		utils.IdentifySqlError(w, err)
		return
	}
	err = suspendChatId(userId, targetUserId)
	if err != nil {
		utils.IdentifySqlError(w, err)
		return
	}
	unfollowResponse(w, r)
}

// GET /api/v1/users/:user_id/followers => list followers
func FollowersListHandler(w http.ResponseWriter, r *http.Request) {
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	userId := utils.GetUserIdFromContext(r)

	res, err := GetFollowersByUserID(targetUserId, userId)
	if err != nil {
		utils.InternalServerError(w)
		return
	}
	utils.WriteSuccess(w, http.StatusAccepted, res)
}

// GET /api/v1/users/:user_id/following  => list followees
func FolloweesListHandler(w http.ResponseWriter, r *http.Request) {
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	userId := utils.GetUserIdFromContext(r)

	res, err := GetFolloweesByUserID(targetUserId, userId)
	if err != nil {
		utils.InternalServerError(w)
		return
	}
	utils.WriteSuccess(w, http.StatusAccepted, res)
}

// GET /api/v1/follow-requests => list received follow requests for current user
func FollowRequestListHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	res, err := GetFollowRequestByUserID(userId)
	if err != nil {
		utils.InternalServerError(w)
		return
	}
	utils.WriteSuccess(w, http.StatusAccepted, res)
}

// POST /api/v1/follow-requests/:user_id/accept => accept request
func AcceptFollowHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	err := acceptFollowRequest(targetUserId, userId)
	if err != nil {
		utils.InternalServerError(w)
		return
	}
	err = createChatId(targetUserId, userId)
	if err != nil {
		utils.IdentifySqlError(w, err)
		return
	}
	acceptFollowResponse(w, r)
}

// POST /api/v1/follow-requests/:user_id/decline => decline request
func DeclineFollowHandler(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	err := declineFollowRequest(targetUserId, userId)
	if err != nil {
		utils.InternalServerError(w)
		return
	}
	declineFollowResponse(w, r)
}
