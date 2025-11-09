package posts

import (
	"net/http"
	"social/pkg/config"
	"social/pkg/utils"
)

// PostViewMiddleware checks if user has permission to view a post
func PostViewMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(config.USER_ID_KEY).(int64)
		if !ok {
			utils.Unauthorized(w, "Invalid user")
			return
		}

		postID, err := getPostID(r)
		if err != nil {
			utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
			return
		}

		if !canViewPost(userID, postID) {
			utils.ForbiddenError(w, "You don't have permission to view this post")
			return
		}

		next(w, r)
	}
}

// PostEditMiddleware checks if user has permission to edit a post
func PostEditMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(config.USER_ID_KEY).(int64)
		if !ok {
			utils.Unauthorized(w, "Invalid user")
			return
		}

		postID, err := getPostID(r)
		if err != nil {
			utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
			return
		}

		if !canEditPost(userID, postID) {
			utils.ForbiddenError(w, "You don't have permission to edit this post")
			return
		}

		next(w, r)
	}
}

// PostDeleteMiddleware checks if user has permission to delete a post
func PostDeleteMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(config.USER_ID_KEY).(int64)
		if !ok {
			utils.Unauthorized(w, "Invalid user")
			return
		}

		postID, err := getPostID(r)
		if err != nil {
			utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
			return
		}

		if !canDeletePost(userID, postID) {
			utils.ForbiddenError(w, "You don't have permission to delete this post")
			return
		}

		next(w, r)
	}
}

// CommentViewMiddleware checks if user has permission to view comments on a post
func CommentViewMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(config.USER_ID_KEY).(int64)
		if !ok {
			utils.Unauthorized(w, "Invalid user")
			return
		}

		postID, err := getPostID(r)
		if err != nil {
			utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
			return
		}

		// User must be able to view the post to see its comments
		if !canViewPost(userID, postID) {
			utils.ForbiddenError(w, "You don't have permission to view comments on this post")
			return
		}

		next(w, r)
	}
}

// CommentDeleteMiddleware checks if user has permission to delete a comment
func CommentDeleteMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(config.USER_ID_KEY).(int64)
		if !ok {
			utils.Unauthorized(w, "Invalid user")
			return
		}

		commentID, err := getCommentID(r)
		if err != nil {
			utils.BadRequest(w, "Invalid comment ID", utils.ErrorTypeAlert)
			return
		}

		if !canDeleteComment(userID, commentID) {
			utils.ForbiddenError(w, "You don't have permission to delete this comment")
			return
		}

		next(w, r)
	}
}

// UserPostsViewMiddleware checks if user has permission to view another user's posts
func UserPostsViewMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		requesterID, ok := r.Context().Value(config.USER_ID_KEY).(int64)
		if !ok {
			utils.Unauthorized(w, "Invalid user")
			return
		}

		targetUserID, err := getUserID(r)
		if err != nil {
			utils.BadRequest(w, "Invalid user ID", utils.ErrorTypeAlert)
			return
		}

		if !canViewUserPosts(requesterID, targetUserID) {
			utils.ForbiddenError(w, "You don't have permission to view this user's posts")
			return
		}

		next(w, r)
	}
}