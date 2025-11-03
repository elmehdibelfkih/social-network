package follow

import (
	"net/http"
	"social/pkg/utils"
)

// POST /api/v1/users/:user_id/follow => send follow request or follow immediately if target is public
func FollowRequestMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request FollowRequestJson

		if !utils.ValidateJsonRequest(w, r, &request, "Follow Request Middle Ware") {
			return
		}

		// todo: check if the user try to send a request to hem self
		// todo: check if the user already follow the user target
		// todo: check if the user want to unfollow hem silf

	}
}

// POST /api/v1/users/:user_id/unfollow => unfollow
func UnfollowRequestMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request UnfollowRequestJson

		if !utils.ValidateJsonRequest(w, r, &request, "Follow Request Middle Ware") {
			return
		}

		// todo: check if the user already follow the user target
		// todo: check if the user want to follow hem silf

	}
}

// GET /api/v1/users/:user_id/followers => list followers
// GET /api/v1/users/:user_id/following  => list followees
func FollowersFolloweesListMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//todo: check if the user want to get his own followers/followees
		//todo: check if the target user have a public profile (if yes continue to the handler)
		//todo: if not check if the current user one of the followers of the target user (if yes continue to the handler)

	}
}

// func FolloweesListMiddleWare(next http.HandlerFunc) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {

// 	}
// }

// GET /api/v1/follow-requests => list received follow requests for current user
func FollowRequestListMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

	}
}

// POST /api/v1/follow-requests/:user_id/accept => accept request
func AcceptFollowRequestMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request AcceptFollowRequestJson

		if !utils.ValidateJsonRequest(w, r, &request, "Follow Request Middle Ware") {
			return
		}

		//todo: check if the user try accept an invetation from him self (i think is protected by default)
		//todo: check if the current user have a follow request from the target user.

	}
}

// POST /api/v1/follow-requests/:user_id/decline => decline request
func DeclineFollowRequestMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request DeclineRequestJson

		if !utils.ValidateJsonRequest(w, r, &request, "Follow Request Middle Ware") {
			return
		}

		//todo: check if the user try decline an invetation from him self (i think is protected by default)
		//todo: check if the current user have a follow request from the target user.
	}
}
