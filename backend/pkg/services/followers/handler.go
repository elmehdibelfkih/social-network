package follow

import (
	"fmt"
	"net/http"
	"social/pkg/utils"
)

// POST /api/v1/users/:user_id/follow => send follow request or follow immediately if target is public
func FollowRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	err := followUser(userId, targetUserId)
	if err != nil {
		utils.InternalServerError(w)
	}
	// todo: check notNound and supper flous error
}

// POST /api/v1/users/:user_id/unfollow => unfollow
func UnfollowRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	err := unfollowUser(userId, targetUserId)
	if err != nil {
		utils.InternalServerError(w)
	}
}

// GET /api/v1/users/:user_id/followers => list followers
func FollowersList(w http.ResponseWriter, r *http.Request) {
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	res, err := GetFollowersByUserID(targetUserId)
	if err != nil {
		utils.InternalServerError(w)
	}
	fmt.Println(res)
}

// GET /api/v1/users/:user_id/following  => list followees
func FolloweesList(w http.ResponseWriter, r *http.Request) {
	targetUserId := utils.GetWildCardValue(w, r, "user_id")
	res, err := GetFollowersByUserID(targetUserId)
	if err != nil {
		utils.InternalServerError(w)
	}
	fmt.Println(res)
}

// GET /api/v1/follow-requests => list received follow requests for current user
func FollowRequestList(w http.ResponseWriter, r *http.Request) {

}

// POST /api/v1/follow-requests/:user_id/accept => accept request
func AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {

}

// POST /api/v1/follow-requests/:user_id/decline => decline request
func DeclineFollowRequest(w http.ResponseWriter, r *http.Request) {

}
