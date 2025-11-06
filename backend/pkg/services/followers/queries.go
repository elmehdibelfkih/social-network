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
	FOLLOW_REQUEST_QUERY         = ``
	UNFOLLOW_REQUEST_QUERY       = ``
	ACCEPT_FOLLOW_REQUEST_QUERY  = ``
	DECLINE_FOLLOW_REQUEST_QUERY = ``

	// SELECT
	FOLLOWERS_LIST_QUERY      = ``
	FOLLOWEEES_LIST_QUERY     = ``
	FOLLOW_REQUEST_LIST_QUERY = ``

	SELECT_FOLLOW_STATUS_QUERY   = `SELECT status FROM follows WHER follower_id = ? AND followed_id = ?`
	USER_EXISTS_QUERY            = `SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)`
	IS_USER_PROFILE_PUBLIC_QUERY = `SELECT is_public FROM users WHERE user_id = ?`

	GET_FOLLOWERS_QUERY = `
	SELECT 
		u.user_id AS userId,
		u.nickname,
		u.first_name AS firstName,
		u.last_name AS lastName,
		u.avatar_id AS avatarId,
		f.created_at AS followedAt,
		f.status
	FROM follows f
	JOIN users u ON f.follower_id = u.user_id
	WHERE f.followed_id = ?
	ORDER BY f.created_at DESC;
	`

	GET_FOLLOWEES_QUERY = `
	SELECT 
	  u.user_id AS userId,
	  u.nickname,
	  u.first_name AS firstName,
	  u.last_name AS lastName,
	  u.avatar_id AS avatarId,
	  f.created_at AS followedAt,
	  f.status
	FROM follows f
	JOIN users u ON f.followed_id = u.user_id
	WHERE f.follower_id = ?
	ORDER BY f.created_at DESC;`
)
