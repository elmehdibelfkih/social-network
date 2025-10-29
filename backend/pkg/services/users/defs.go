package users

type UserRequestJson struct {
	UserId      int64                `json:"userId"`
	Status      string               `json:"status"`
	Nickname    string               `json:"nickname"`
	FirstName   string               `json:"firstName"`
	LastName    string               `json:"lastName"`
	AvatarId    int64                `json:"avatarId"`
	AboutMe     string               `json:"aboutMe"`
	DataOfBirth string               `json:"dateOfBirth"`
	Privacy     string               `json:"privacy"`
	Stats       UserRequestStatsJson `json:"stats"`
	JoinedAt    string               `json:"joinedAt"`
}

type UserRequestStatsJson struct {
	PostsCount     int64 `json:"postsCount"`
	FollowersCount int64 `json:"followersCount"`
	FollowingCount int64 `json:"followingCount"`
}
