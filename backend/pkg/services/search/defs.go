package search

type SearchResponse struct {
	Results []any  `json:"results"`
}

type UserSearchResult struct {
	ID         int64  `json:"id" db:"id"`
	Username   *string `json:"username" db:"nickname"`
	Firstname  string `json:"firstName" db:"first_name"`
	Lastname   string `json:"lastName" db:"last_name"`
	AvatarPath *string `json:"avatarPath" db:"avatar_path"`
}

type GroupSearchResult struct {
	ID          int64   `json:"id" db:"id"`
	Name        string  `json:"title" db:"title"`
	Description *string `json:"description,omitempty" db:"description"`
	AvatarPath  *string `json:"avatarPath,omitempty" db:"avatar_url"`
}

type PostSearchResult struct {
	ID        int64      `json:"id" db:"id"`
	Content   string     `json:"content" db:"content"`
	CreatedAt string     `json:"createdAt" db:"created_at"`
	Author    PostAuthor `json:"author"`
}

type PostAuthor struct {
	ID         int64   `json:"id" db:"id"`
	Username   *string `json:"username" db:"username"`
	AvatarPath *string `json:"avatarPath,omitempty" db:"avatar_path"`
}
