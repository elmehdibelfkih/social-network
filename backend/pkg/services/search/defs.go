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
}

type GroupSearchResult struct {
	ID          int64   `json:"groupId" db:"id"`
	Name        string  `json:"title" db:"title"`
	Description *string `json:"description,omitempty" db:"description"`
	AvatarId    *int64  `json:"avatarId,omitempty" db:"avatar_id"`
}

type PostSearchResult struct {
	ID        int64      `json:"postId" db:"id"`
	Content   string     `json:"content" db:"content"`
	CreatedAt string     `json:"createdAt" db:"created_at"`
	Author    PostAuthor `json:"author"`
}

type PostAuthor struct {
	ID       int64   `json:"userId" db:"id"`
	Username *string `json:"username" db:"username"`
	AvatarId *int64  `json:"avatarId,omitempty" db:"avatar_id"`
}
