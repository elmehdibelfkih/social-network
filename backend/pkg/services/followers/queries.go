package follow

// POST /api/v1/users/:user_id/follow => send follow request or follow immediately if target is public
// func FollowRequest(w http.ResponseWriter, r *http.Request)

// POST /api/v1/users/:user_id/unfollow => unfollow
// func UnfollowRequest(w http.ResponseWriter, r *http.Request)

// GET /api/v1/users/:user_id/followers => list followers
// func FollowersList(w http.ResponseWriter, r *http.Request)

// GET /api/v1/users/:user_id/following  => list followees
// func FolloweesList(w http.ResponseWriter, r *http.Request)

// GET /api/v1/follow-requests => list received follow requests for current user
// func FollowRequestList(w http.ResponseWriter, r *http.Request)

// POST /api/v1/follow-requests/:user_id/accept => accept request
// func AcceptFollowRequest(w http.ResponseWriter, r *http.Request)

// POST /api/v1/follow-requests/:user_id/decline => decline request
// func DeclineFollowRequest(w http.ResponseWriter, r *http.Request)

const (
	// INSERT
	FOLLOW_REQUEST         = ``
	UNFOLLOW_REQUEST       = ``
	ACCEPT_FOLLOW_REQUEST  = ``
	DECLINE_FOLLOW_REQUEST = ``

	// SELECT
	FOLLOWERS_LIST      = ``
	FOLLOWEEES_LIST     = ``
	FOLLOW_REQUEST_LIST = ``
)
