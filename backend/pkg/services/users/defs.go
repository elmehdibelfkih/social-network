package users

// Request structs
type UpdateProfileRequestJson struct {
	FirstName   *string `json:"firstName"`
	LastName    *string `json:"lastName"`
	Nickname    *string `json:"nickname"`
	AboutMe     *string `json:"aboutMe"`
	AvatarId    *int64  `json:"avatarId"`
	DateOfBirth *string `json:"dateOfBirth"`
	Email       *string `json:"email"`
}

type UpdatePrivacyRequestJson struct {
	Privacy string `json:"privacy"`
}

// Response structs
type UserProfileResponseJson struct {
	UserId      int64                `json:"userId"`
	Status      *string              `json:"status"` // pending/accepted/declined or NULL
	Nickname    *string              `json:"nickname"`
	FirstName   string               `json:"firstName"`
	LastName    string               `json:"lastName"`
	AvatarId    *int64               `json:"avatarId"`
	AboutMe     *string              `json:"aboutMe"`
	DateOfBirth string               `json:"dateOfBirth"`
	Privacy     string               `json:"privacy"`
	ChatId      *string              `jsone:"chatId"`
	Stats       UserProfileStatsJson `json:"stats"`
	JoinedAt    string               `json:"joinedAt"`
}

type UserProfileStatsJson struct {
	PostsCount     int64 `json:"postsCount"`
	FollowersCount int64 `json:"followersCount"`
	FollowingCount int64 `json:"followingCount"`
}

type UserStatsResponseJson struct {
	UserId           int64 `json:"userId"`
	PostsCount       int64 `json:"postsCount"`
	FollowersCount   int64 `json:"followersCount"`
	FollowingCount   int64 `json:"followingCount"`
	LikesReceived    int64 `json:"likesReceived"`
	CommentsReceived int64 `json:"commentsReceived"`
}

type UpdateProfileResponseJson struct {
	Message string `json:"message"`
}

type UpdatePrivacyResponseJson struct {
	Message string `json:"message"`
	Privacy string `json:"privacy"`
}

// Internal structs for database operations
type UserProfile struct {
	Id          int64
	Email       string
	Nickname    *string
	FirstName   string
	LastName    string
	DateOfBirth string
	AvatarId    *int64
	AboutMe     *string
	Privacy     string
	CreatedAt   string
}

type FollowStatusType struct {
	Status *string `json:"status`
}

// type FollowChatId struct {
// 	ChatId *string `json:"chatId`
// }
