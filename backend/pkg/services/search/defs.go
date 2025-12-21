package search

type SearchResponse struct {
	Results []any  `json:"results"`
}

type UserSearchResult struct {
	ID        int64   `json:"userId" db:"id"`
	Username  *string `json:"nickname" db:"nickname"`
	Firstname string  `json:"firstName" db:"first_name"`
	Lastname  string  `json:"lastName" db:"last_name"`
	AvatarId  *int64  `json:"avatarId" db:"avatar_id"`
	Privacy   string  `json:"privacy" db:"privacy"`
}

type GroupSearchResult struct {
	ID          int64   `json:"groupId" db:"id"`
	Name        string  `json:"title" db:"title"`
	Description *string `json:"description,omitempty" db:"description"`
	AvatarId    *int64  `json:"avatarId,omitempty" db:"avatar_id"`
	CreatorId   int64   `json:"creatorId" db:"creator_id"`
	MemberCount int64   `json:"memberCount"`
}

type PostSearchResult struct {
	ID               int64   `json:"postId" db:"id"`
	AuthorId         int64   `json:"authorId" db:"author_id"`
	Content          string  `json:"content" db:"content"`
	CreatedAt        string  `json:"createdAt" db:"created_at"`
	AuthorNickname   *string `json:"authorNickname" db:"author_nickname"`
	AuthorFirstName  string  `json:"authorFirstName" db:"author_first_name"`
	AuthorLastName   string  `json:"authorLastName" db:"author_last_name"`
	Privacy          string  `json:"privacy" db:"privacy"`
	Stats            PostStats `json:"stats"`
	IsLikedByUser    bool    `json:"isLikedByUser"`
	MediaIds         []int64 `json:"mediaIds"`
	GroupId          *int64  `json:"groupId" db:"group_id"`
	UpdatedAt        string  `json:"updatedAt" db:"updated_at"`
}

type PostStats struct {
	ReactionCount int64 `json:"reactionCount"`
	CommentCount  int64 `json:"commentCount"`
}
