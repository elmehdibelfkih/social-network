package posts

// Post represents a post in the database
type Post struct {
	ID        int64  `db:"id"`
	AuthorID  int64  `db:"author_id"`
	GroupID   *int64 `db:"group_id"`
	Content   string `db:"content"`
	Privacy   string `db:"privacy"`
	CreatedAt string `db:"created_at"`
	UpdatedAt string `db:"updated_at"`
}

// Comment represents a comment in the database
type Comment struct {
	ID        int64  `db:"id"`
	PostID    int64  `db:"post_id"`
	AuthorID  int64  `db:"author_id"`
	Content   string `db:"content"`
	CreatedAt string `db:"created_at"`
	UpdatedAt string `db:"updated_at"`
}

// AuthorDetails represents author information
type AuthorDetails struct {
	FirstName string
	LastName  string
	Nickname  string
}

// PostReaction represents a reaction to a post
type PostReaction struct {
	ID        int64  `db:"id"`
	UserID    int64  `db:"user_id"`
	PostID    int64  `db:"post_id"`
	Reaction  string `db:"reaction"`
	CreatedAt string `db:"created_at"`
	UpdatedAt string `db:"updated_at"`
}

// CreatePostRequest represents the request body for creating a post
type CreatePostRequest struct {
	Content     string  `json:"content"`
	Privacy     string  `json:"privacy"`
	AllowedList []int64 `json:"allowedList"`
	GroupID     *int64  `json:"groupId"`
	MediaIDs    []int64 `json:"mediaIds"`
}

// CreatePostResponse represents the response after creating a post
type CreatePostResponse struct {
	Message   string  `json:"message"`
	PostID    int64   `json:"postId"`
	AuthorID  int64   `json:"authorId"`
	Privacy   string  `json:"privacy"`
	GroupID   *int64  `json:"groupId"`
	MediaIDs  []int64 `json:"mediaIds"`
	CreatedAt string  `json:"createdAt"`
}

// GetPostResponse represents a single post response
type GetPostResponse struct {
	PostID          int64   `json:"postId"`
	AuthorID        int64   `json:"authorId"`
	AuthorFirstName string  `json:"authorFirstName"`
	AuthorLastName  string  `json:"authorLastName"`
	AuthorNickname  string  `json:"authorNickname"`
	Content         string  `json:"content"`
	MediaIDs        []int64 `json:"mediaIds"`
	Privacy         string  `json:"privacy"`
	GroupID         *int64  `json:"groupId"`
	AllowedList     []int64 `json:"allowedList"`
	CreatedAt       string  `json:"createdAt"`
	UpdatedAt       string  `json:"updatedAt"`
}

// UpdatePostRequest represents the request body for updating a post
type UpdatePostRequest struct {
	Content     string  `json:"content"`
	Privacy     string  `json:"privacy"`
	AllowedList []int64 `json:"allowedList"`
	MediaIDs    []int64 `json:"mediaIds"`
}

// UpdatePostResponse represents the response after updating a post
type UpdatePostResponse struct {
	Message string          `json:"message"`
	Post    GetPostResponse `json:"post"`
}

// DeletePostResponse represents the response after deleting a post
type DeletePostResponse struct {
	Message string `json:"message"`
}

// ListUserPostsResponse represents the response for listing user posts
type ListUserPostsResponse struct {
	UserID     int64             `json:"userId"`
	Page       int               `json:"page"`
	Limit      int               `json:"limit"`
	TotalPosts int               `json:"totalPosts"`
	Posts      []GetPostResponse `json:"posts"`
}

// CreateCommentRequest represents the request body for creating a comment
type CreateCommentRequest struct {
	Content  string  `json:"content"`
	MediaIDs []int64 `json:"mediaIds"`
}

// CreateCommentResponse represents the response after creating a comment
type CreateCommentResponse struct {
	Message   string  `json:"message"`
	CommentID int64   `json:"commentId"`
	PostID    int64   `json:"postId"`
	AuthorID  int64   `json:"authorId"`
	Content   string  `json:"content"`
	MediaIDs  []int64 `json:"mediaIds"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

// CommentResponse represents a single comment
type CommentResponse struct {
	CommentID       int64   `json:"commentId"`
	AuthorID        int64   `json:"authorId"`
	AuthorFirstName string  `json:"authorFirstName"`
	AuthorLastName  string  `json:"authorLastName"`
	AuthorNickname  string  `json:"authorNickname"`
	Content         string  `json:"content"`
	MediaIDs        []int64 `json:"mediaIds"`
	CreatedAt       string  `json:"createdAt"`
	UpdatedAt       string  `json:"updatedAt"`
}

// ListCommentsResponse represents the response for listing comments
type ListCommentsResponse struct {
	PostID        int64             `json:"postId"`
	Page          int               `json:"page"`
	Limit         int               `json:"limit"`
	TotalComments int               `json:"totalComments"`
	Comments      []CommentResponse `json:"comments"`
}

// DeleteCommentResponse represents the response after deleting a comment
type DeleteCommentResponse struct {
	Message string `json:"message"`
}

// LikePostResponse represents the response after liking a post
type LikePostResponse struct {
	Message   string `json:"message"`
	PostID    int64  `json:"postId"`
	UserID    int64  `json:"userId"`
	Reaction  string `json:"reaction"`
	CreatedAt string `json:"createdAt"`
}

// UnlikePostResponse represents the response after removing a like
type UnlikePostResponse struct {
	Message string `json:"message"`
	PostID  int64  `json:"postId"`
	UserID  int64  `json:"userId"`
}

// Privacy constants
const (
	PrivacyPublic     = "public"
	PrivacyFollowers  = "followers"
	PrivacyPrivate    = "private"
	PrivacyGroup      = "group"
	PrivacyRestricted = "restricted"
)

// Reaction constants
const (
	ReactionLike    = "like"
	ReactionDislike = "dislike"
)

// Allowed privacy values
var AllowedPrivacy = map[string]bool{
	PrivacyPublic:     true,
	PrivacyFollowers:  true,
	PrivacyPrivate:    true,
	PrivacyGroup:      true,
	PrivacyRestricted: true,
}

// Allowed reaction values
var AllowedReactions = map[string]bool{
	ReactionLike:    true,
	ReactionDislike: true,
}

// Default pagination values
const (
	DefaultPage  = 1
	DefaultLimit = 20
	MaxLimit     = 100
)
