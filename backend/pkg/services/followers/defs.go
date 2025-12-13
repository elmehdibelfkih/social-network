package follow

// POST /api/v1/users/:user_id/follow
// No need for a request body.
type FollowResponseJson struct {
	Message      string `json:"message"`
	Status       string `json:"status"`
	TargetUserId int64  `json:"targetUserId"`
	FollowerId   int64  `json:"followerId"`
}

// POST /api/v1/users/:user_id/unfollow
// No need for a request body.
type UnfollowResponseJson struct {
	Message      string `json:"message"`
	TargetUserId int64  `json:"targetUserId"`
	FollowerId   int64  `json:"followerId"`
}

type UserFollowItem struct {
	UserId    int64                `json:"userId"`
	Status    *string              `json:"status"` // pending/accepted/declined or NULL
	Nickname  *string              `json:"nickname"`
	FirstName string               `json:"firstName"`
	LastName  string               `json:"lastName"`
	AvatarId  *int64               `json:"avatarId"`
	Privacy   string               `json:"privacy"`
	ChatId    *int64               `json:"chatId"`
	Stats     UserProfileStatsJson `json:"stats"`
	JoinedAt  *string              `json:"joinedAt"`
}

type UserProfileStatsJson struct {
	PostsCount     int64 `json:"postsCount"`
	FollowersCount int64 `json:"followersCount"`
	FollowingCount int64 `json:"followingCount"`
}

// GET /api/v1/users/:user_id/followers
// No request body.
type FollowersListResponseJson struct {
	Followers []UserFollowItem `json:"followers"`
}

// GET /api/v1/users/:user_id/following
// No request body.

type FolloweesLisResponseJson struct {
	Following []UserFollowItem `json:"following"`
}

// GET /api/v1/follow-requests
// No request body.

type FollowRequestResponseJson struct {
	FollowRequests []UserFollowItem `json:"followRequests"`
}

// POST /api/v1/follow-requests/:user_id/accept
// No request body.

type AcceptFollowResponseJson struct {
	Message    string `json:"message"`
	FollowerId int64  `json:"followerId"`
	FollowedId int64  `json:"followedId"`
	Status     string `json:"status"`
}

// POST /api/v1/follow-requests/:user_id/decline
// No request body.

type DeclineResponseJson struct {
	Message    string `json:"message"`
	FollowerId int64  `json:"followerId"`
	FollowedId int64  `json:"followedId"`
	Status     string `json:"status"`
}
type Notification struct {
	id            int64
	UserId        int64
	Type          string
	ReferenceType string
	ReferenceId   int64
	Content       string
	status        string
}
