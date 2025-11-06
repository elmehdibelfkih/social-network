package follow

type contextKey string

// context keys
const REQUEST_STRUCT_KEY contextKey = "requestStruct"

// POST /api/v1/users/:user_id/follow
// No need for a request body.
type FollowRequestJson struct{}
type FollowResponseJson struct {
	Message      string `json:"message"`
	Status       string `json:"status"`
	TargetUserId int64  `json:"targetUserId"`
	FollowerId   int64  `json:"followerId"`
	FollowedAt   string `json:"followedAt"`
}

// POST /api/v1/users/:user_id/unfollow
// No need for a request body.
type UnfollowRequestJson struct{}
type UnfollowResponseJson struct {
	Message      string `json:"message"`
	TargetUserId int64  `json:"targetUserId"`
	FollowerId   int64  `json:"followerId"`
	UnfollowedAt string `json:"unfollowedAt"`
}

// GET /api/v1/users/:user_id/followers
// No request body.
type FollowersListResponseJson struct {
	Followers []FollowerItem `json:"followers"`
}

type FollowerItem struct {
	UserId     int64  `json:"userId"`
	Nickname   string `json:"nickname"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	AvatarId   int64  `json:"avatarId"`
	FollowedAt string `json:"followedAt"`
	Status     string `json:"status"` // pending/accepted/declined
}

// GET /api/v1/users/:user_id/following
// No request body.

type FolloweesLisResponseJson struct {
	Following []FolloweeItem `json:"following"`
}

type FolloweeItem struct {
	UserId     int64  `json:"userId"`
	Nickname   string `json:"nickname"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	AvatarId   int64  `json:"avatarId"`
	FollowedAt string `json:"followedAt"`
	Status     string `json:"status"` // pending/accepted/declined
}

// GET /api/v1/follow-requests
// No request body.

type FollowRequestResponseJson struct {
	FollowRequests []FollowRequestItem `json:"followRequests"`
}

type FollowRequestItem struct {
	FollowerId  int64  `json:"followerId"`
	Nickname    string `json:"nickname"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	AvatarId    int64  `json:"avatarId"`
	RequestedAt string `json:"requestedAt"`
	Status      string `json:"status"`
}

// POST /api/v1/follow-requests/:user_id/accept
// No request body.
type AcceptFollowRequestJson struct{}

type AcceptFollowResponseJson struct {
	Message    string `json:"message"`
	FollowerId int64  `json:"followerId"`
	FollowedId int64  `json:"followedId"`
	Status     string `json:"status"`
	AcceptedAt string `json:"acceptedAt"`
}

// POST /api/v1/follow-requests/:user_id/decline
// No request body.
type DeclineRequestJson struct{}

type DeclineResponseJson struct {
	Message    string `json:"message"`
	FollowerId int64  `json:"followerId"`
	FollowedId int64  `json:"followedId"`
	Status     string `json:"status"`
	DeclinedAt string `json:"declinedAt"`
}

type Notification struct {
	UserID      int64
	Type        string
	ReferenceID int64
	Content     string
}
