package feed

// FeedPostResponseJson represents a single post in the feed response
type FeedPostResponseJson struct {
	PostId          int64             `json:"postId"`
	AuthorId        int64             `json:"authorId"`
	AuthorNickname  *string           `json:"authorNickname"` // or null
	AuthorLastName  string            `json:"authorlastName"`
	AuthorFirstName string            `json:"authorFirstName"`
	Content         string            `json:"content"`
	MediaIds        []int64           `json:"mediaIds"` // or null
	Privacy         string            `json:"privacy"`  // public, followers, private
	IsLikedByUser   bool              `json:"isLikedByUser"`
	Stats           FeedPostStatsJson `json:"stats"`
	CreatedAt       string            `json:"createdAt"`
	UpdatedAt       string            `json:"updatedAt"`
	GroupId         *int64            `json:"groupId"` // or null
}

// FeedPostStatsJson contains reaction and comment counts
type FeedPostStatsJson struct {
	ReactionCount int64 `json:"reactionCount"`
	CommentCount  int64 `json:"commentCount"`
}
