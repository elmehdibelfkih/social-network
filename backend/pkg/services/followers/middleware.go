package follow

import (
	"net/http"
	"social/pkg/utils"
)

// POST /api/v1/users/:user_id/follow => send follow request or follow immediately if target is public
func FollowRequestMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		targetUserId := utils.GetWildCardValue(w, r, "user_id")

		isExist, err := userExists(targetUserId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}
		if !isExist {
			utils.NotFoundError(w, "the tagret user is not exist")
			return
		}

		if userId == targetUserId {
		POST /api/v1/users/:user_id/follow 	utils.BadRequest(w, "You cannot follow yourself.", "alert")
			return
		}

		status, err := selectFollowStatus(userId, targetUserId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}

		switch status {
		case "pending":
			utils.BadRequest(w, "Follow request already sent.", "alert")
			return
		case "accepted":
			utils.BadRequest(w, "You already follow this user.", "alert")
			return
		}

		next(w, r)
	}
}

// POST /api/v1/users/:user_id/unfollow => unfollow
func UnfollowRequestMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		targetUserId := utils.GetWildCardValue(w, r, "user_id")

		isExist, err := userExists(targetUserId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}
		if !isExist {
			utils.NotFoundError(w, "the tagret user is not exist")
			return
		}

		if userId == targetUserId {
			utils.BadRequest(w, "You cannot unfollow yourself.", "alert")
			println("hani")
			return
		}

		status, err := selectFollowStatus(userId, targetUserId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}

		if status == "" || status == "decline" {
			utils.BadRequest(w, "You are not follower of this user.", "alert")
			return
		}

		next(w, r)
	}
}

// GET /api/v1/users/:user_id/followers => list followers
// GET /api/v1/users/:user_id/following  => list followees
func FollowersFolloweesListMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		targetUserId := utils.GetWildCardValue(w, r, "user_id")

		isExist, err := userExists(targetUserId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}
		if !isExist {
			utils.NotFoundError(w, "the tagret user is not exist")
			return
		}

		isPublic, err := isPublic(targetUserId)
		status, err1 := selectFollowStatus(userId, targetUserId)
		if err != nil || err1 != nil {
			utils.InternalServerError(w)
			return
		}
		if !isPublic && status != "accepted" {
			utils.BadRequest(w, "This acoount is private", "alert")
			return
		}
		next(w, r)
	}
}

// GET /api/v1/follow-requests => list received follow requests for current user
//FIXME: mayby we dont need that function

// POST /api/v1/follow-requests/:user_id/accept => accept request
func AcceptFollowRequestMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		targetUserId := utils.GetWildCardValue(w, r, "user_id")

		if userId == targetUserId {
			utils.BadRequest(w, "You cannot accept an invitation from your yourself.", "alert")
			return
		}

		isExist, err := userExists(targetUserId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}
		if !isExist {
			utils.NotFoundError(w, "the tagret user is not exist")
			return
		}

		status, err := selectFollowStatus(targetUserId, userId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}

		if status != "pending" {
			utils.BadRequest(w, "You cannot accept an invitation dose not exist.", "alert")
			return
		}
		next(w, r)
	}
}

// POST /api/v1/follow-requests/:user_id/decline => decline request
func DeclineFollowRequestMiddleWare(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		targetUserId := utils.GetWildCardValue(w, r, "user_id")

		if userId == targetUserId {
			utils.BadRequest(w, "You cannot decline an invitation from your yourself.", "alert")
			return
		}

		isExist, err := userExists(targetUserId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}
		if !isExist {
			utils.NotFoundError(w, "the tagret user is not exist")
			return
		}

		status, err := selectFollowStatus(targetUserId, userId)
		if err != nil {
			utils.InternalServerError(w)
			return
		}

		if status != "pending" {
			utils.BadRequest(w, "You cannot decline an invitation dose not exist.", "alert")
			return
		}
		next(w, r)
	}
}
