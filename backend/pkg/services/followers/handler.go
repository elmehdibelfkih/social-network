package follow

import (
	"net/http"
	"social/pkg/utils"
)

// POST /api/v1/users/:user_id/follow => send follow request or follow immediately if target is public
func FollowRequest(w http.ResponseWriter, r *http.Request) {
	var request FollowRequestJson
	// var response FollowResponseJson

	if !utils.ValidateJsonRequest(w, r, &request, "FollowRequest handler") {
		return
	}

}

// POST /api/v1/users/:user_id/unfollow => unfollow
func UnfollowRequest(w http.ResponseWriter, r *http.Request) {

}

// GET /api/v1/users/:user_id/followers => list followers
func FollowersList(w http.ResponseWriter, r *http.Request) {

}

// GET /api/v1/users/:user_id/following  => list followees
func FolloweesList(w http.ResponseWriter, r *http.Request) {

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
