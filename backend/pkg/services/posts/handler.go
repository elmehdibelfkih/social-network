package posts

import (
	"database/sql"
	"net/http"
	"time"

	"social/pkg/config"
	"social/pkg/utils"
)

func HandleCreatePost(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	var req CreatePostRequest
	if err := utils.JsonStaticDecode(r, &req); err != nil {
		utils.BadRequest(w, "Invalid request body", utils.ErrorTypeAlert)
		return
	}
	// Validate privacy
	if !validatePrivacy(req.Privacy) {
		utils.BadRequest(w, "Invalid privacy setting", utils.ErrorTypeAlert)
		return
	}
	// Validate group post
	if req.Privacy == PrivacyGroup && req.GroupID == nil {
		utils.BadRequest(w, "Group ID is required for group posts", utils.ErrorTypeAlert)
		return
	}
	// Validate restricted post
	if req.Privacy == PrivacyRestricted && len(req.AllowedList) == 0 {
		utils.BadRequest(w, "Allowed list is required for restricted posts", utils.ErrorTypeAlert)
		return
	}
	// Create post
	now := time.Now().Format(time.RFC3339)
	post := &Post{
		ID:        utils.GenerateID(),
		AuthorID:  userID,
		GroupID:   req.GroupID,
		Content:   req.Content,
		Privacy:   req.Privacy,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if err := CreatePost(post); err != nil {
		utils.SQLiteErrorTarget(err, "HandleCreatePost (CreatePost)")
		utils.InternalServerError(w)
		return
	}
	// Insert media associations
	if len(req.MediaIDs) > 0 {
		if err := InsertPostMedia(post.ID, req.MediaIDs); err != nil {
			utils.SQLiteErrorTarget(err, "HandleCreatePost (InsertPostMedia)")
			utils.InternalServerError(w)
			return
		}
	}
	// Insert allowed viewers for restricted posts
	if req.Privacy == PrivacyRestricted && len(req.AllowedList) > 0 {
		if err := InsertPostAllowedViewers(post.ID, req.AllowedList); err != nil {
			utils.SQLiteErrorTarget(err, "HandleCreatePost (InsertPostAllowedViewers)")
			utils.InternalServerError(w)
			return
		}
	}

	utils.WriteSuccess(w, http.StatusCreated, CreatePostResponse{
		Message:   "Post created successfully.",
		PostID:    post.ID,
		AuthorID:  post.AuthorID,
		Privacy:   post.Privacy,
		GroupID:   post.GroupID,
		MediaIDs:  req.MediaIDs,
		CreatedAt: post.CreatedAt,
	})
}

func HandleGetPost(w http.ResponseWriter, r *http.Request) {
	postID, err := getPostID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
		return
	}

	post, err := GetPostByID(postID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "Post not found")
			return
		}
		utils.SQLiteErrorTarget(err, "HandleGetPost (GetPostByID)")
		utils.InternalServerError(w)
		return
	}

	viewerID := utils.GetUserIdFromContext(r)
	postResponse, err := buildPostResponse(post, viewerID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "HandleGetPost (buildPostResponse)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, postResponse)
}

// HandleUpdatePost handles PUT /api/v1/posts/{post_id}
func HandleUpdatePost(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	postID, err := getPostID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
		return
	}

	var req UpdatePostRequest
	if err := utils.JsonStaticDecode(r, &req); err != nil {
		utils.BadRequest(w, "Invalid request body", utils.ErrorTypeAlert)
		return
	}

	// Validate privacy
	if !validatePrivacy(req.Privacy) {
		utils.BadRequest(w, "Invalid privacy setting", utils.ErrorTypeAlert)
		return
	}

	// Update post
	if err := UpdatePost(postID, userID, req.Content, req.Privacy, time.Now().Format(time.RFC3339)); err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "Post not found or you don't have permission to update it")
			return
		}
		utils.SQLiteErrorTarget(err, "HandleUpdatePost (UpdatePost)")
		utils.InternalServerError(w)
		return
	}

	// Update media associations
	if err := DeletePostMedia(postID); err != nil {
		utils.SQLiteErrorTarget(err, "HandleUpdatePost (DeletePostMedia)")
		utils.InternalServerError(w)
		return
	}

	if len(req.MediaIDs) > 0 {
		if err := InsertPostMedia(postID, req.MediaIDs); err != nil {
			utils.SQLiteErrorTarget(err, "HandleUpdatePost (InsertPostMedia)")
			utils.InternalServerError(w)
			return
		}
	}

	// Update allowed viewers
	if err := DeletePostAllowedViewers(postID); err != nil {
		utils.SQLiteErrorTarget(err, "HandleUpdatePost (DeletePostAllowedViewers)")
		utils.InternalServerError(w)
		return
	}

	if req.Privacy == PrivacyRestricted && len(req.AllowedList) > 0 {
		if err := InsertPostAllowedViewers(postID, req.AllowedList); err != nil {
			utils.SQLiteErrorTarget(err, "HandleUpdatePost (InsertPostAllowedViewers)")
			utils.InternalServerError(w)
			return
		}
	}

	// Get updated post
	post, err := GetPostByID(postID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "HandleUpdatePost (GetPostByID)")
		utils.InternalServerError(w)
		return
	}

	postResponse, err := buildPostResponse(post, userID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "HandleUpdatePost (buildPostResponse)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, UpdatePostResponse{
		Message: "Post updated successfully.",
		Post:    *postResponse,
	})
}

// HandleDeletePost handles DELETE /api/v1/posts/{post_id}
func HandleDeletePost(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	postID, err := getPostID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
		return
	}

	if err := DeletePost(postID, userID); err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "Post not found or you don't have permission to delete it")
			return
		}
		utils.SQLiteErrorTarget(err, "HandleDeletePost (DeletePost)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, DeletePostResponse{
		Message: "Post deleted successfully.",
	})
}

func HandleGetUserPosts(w http.ResponseWriter, r *http.Request) {
	requesterID := utils.GetUserIdFromContext(r)
	targetUserID, err := getUserID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid user ID", utils.ErrorTypeAlert)
		return
	}

	page, limit, offset := getPaginationParams(r)

	posts, totalPosts, err := GetUserPosts(targetUserID, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, "HandleGetUserPosts (GetUserPosts)")
		utils.InternalServerError(w)
		return
	}

	// Filter posts based on permissions
	visiblePosts := filterVisiblePosts(requesterID, posts)

	var postResponses []GetPostResponse
	for _, post := range visiblePosts {
		postResponse, err := buildPostResponse(&post, requesterID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "HandleGetUserPosts (buildPostResponse)")
			continue
		}
		postResponses = append(postResponses, *postResponse)
	}

	if postResponses == nil {
		postResponses = []GetPostResponse{}
	}

	utils.WriteSuccess(w, http.StatusOK, ListUserPostsResponse{
		UserID:     targetUserID,
		Page:       page,
		Limit:      limit,
		TotalPosts: totalPosts,
		Posts:      postResponses,
	})
}

// HandleCreateComment handles POST /api/v1/posts/{post_id}/comments
func HandleCreateComment(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	postID, err := getPostID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
		return
	}

	var req CreateCommentRequest
	if err := utils.JsonStaticDecode(r, &req); err != nil {
		utils.BadRequest(w, "Invalid request body", utils.ErrorTypeAlert)
		return
	}

	// Verify post exists and user can view it
	if !canViewPost(userID, postID) {
		utils.ForbiddenError(w, "You don't have permission to comment on this post")
		return
	}

	// Create comment
	now := time.Now().Format(time.RFC3339)
	comment := &Comment{
		ID:        utils.GenerateID(),
		PostID:    postID,
		AuthorID:  userID,
		Content:   req.Content,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := CreateComment(comment); err != nil {
		utils.SQLiteErrorTarget(err, "HandleCreateComment (CreateComment)")
		utils.InternalServerError(w)
		return
	}

	// Insert media associations
	if len(req.MediaIDs) > 0 {
		if err := InsertCommentMedia(comment.ID, req.MediaIDs); err != nil {
			utils.SQLiteErrorTarget(err, "HandleCreateComment (InsertCommentMedia)")
			utils.InternalServerError(w)
			return
		}
	}

	utils.WriteSuccess(w, http.StatusOK, CreateCommentResponse{
		Message:   "Comment added successfully.",
		CommentID: comment.ID,
		PostID:    comment.PostID,
		AuthorID:  comment.AuthorID,
		Content:   comment.Content,
		MediaIDs:  req.MediaIDs,
		CreatedAt: comment.CreatedAt,
		UpdatedAt: comment.UpdatedAt,
	})
}

// HandleGetComments handles GET /api/v1/posts/{post_id}/comments
func HandleGetComments(w http.ResponseWriter, r *http.Request) {
	viewerID := utils.GetUserIdFromContext(r)
	postID, err := getPostID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
		return
	}

	page, limit, offset := getPaginationParams(r)

	comments, totalComments, err := GetPostComments(postID, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, "HandleGetComments (GetPostComments)")
		utils.InternalServerError(w)
		return
	}

	var commentResponses []CommentResponse
	for _, comment := range comments {
		commentResponse, err := buildCommentResponse(&comment, viewerID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "HandleGetComments (buildCommentResponse)")
			continue
		}
		commentResponses = append(commentResponses, *commentResponse)
	}

	if commentResponses == nil {
		commentResponses = []CommentResponse{}
	}

	utils.WriteSuccess(w, http.StatusOK, ListCommentsResponse{
		PostID:        postID,
		Page:          page,
		Limit:         limit,
		TotalComments: totalComments,
		Comments:      commentResponses,
	})
}

// HandleDeleteComment handles DELETE /api/v1/comments/{comment_id}
func HandleDeleteComment(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	commentID, err := getCommentID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid comment ID", utils.ErrorTypeAlert)
		return
	}

	if err := DeleteComment(commentID, userID); err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "Comment not found or you don't have permission to delete it")
			return
		}
		utils.SQLiteErrorTarget(err, "HandleDeleteComment (DeleteComment)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, DeleteCommentResponse{
		Message: "Comment deleted successfully.",
	})
}

// HandleLikePost handles POST /api/v1/posts/{post_id}/like
func HandleLikePost(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	postID, err := getPostID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
		return
	}

	// Verify post exists and user can view it
	if !canViewPost(userID, postID) {
		utils.ForbiddenError(w, "You don't have permission to like this post")
		return
	}

	// Check if already liked
	if CheckPostReactionExists(postID, userID) {
		if err := DeletePostReaction(postID, userID); err != nil {
			utils.SQLiteErrorTarget(err, "HandleLikePost (DeletePostReaction)")
			utils.InternalServerError(w)
			return
		}
		utils.WriteSuccess(w, http.StatusOK, UnlikePostResponse{
			Message: "Like removed successfully.",
			PostID:  postID,
			UserID:  userID,
		})
		return
	}

	// Create reaction
	if err := CreatePostReaction(postID, userID, ReactionLike); err != nil {
		utils.SQLiteErrorTarget(err, "HandleLikePost (CreatePostReaction)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, LikePostResponse{
		Message:   "Post liked successfully.",
		PostID:    postID,
		UserID:    userID,
		Reaction:  ReactionLike,
		CreatedAt: time.Now().Format(time.RFC3339),
	})
}

// HandleUnlikePost handles DELETE /api/v1/posts/{post_id}/like
func HandleUnlikePost(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	postID, err := getPostID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid post ID", utils.ErrorTypeAlert)
		return
	}

	if err := DeletePostReaction(postID, userID); err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "Like not found")
			return
		}
		utils.SQLiteErrorTarget(err, "HandleUnlikePost (DeletePostReaction)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, UnlikePostResponse{
		Message: "Like removed successfully.",
		PostID:  postID,
		UserID:  userID,
	})
}

// DeletePostMedia is a helper to delete post media associations
func DeletePostMedia(postID int64) error {
	_, err := config.DB.Exec(QUERY_DELETE_POST_MEDIA, postID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "DeletePostMedia")
		return err
	}
	return nil
}

// DeletePostAllowedViewers is a helper to delete post allowed viewers
func DeletePostAllowedViewers(postID int64) error {
	_, err := config.DB.Exec(QUERY_DELETE_POST_ALLOWED_VIEWERS, postID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "DeletePostAllowedViewers")
		return err
	}
	return nil
}

// HandleLikeComment handles POST /api/v1/comments/{comment_id}/like
func HandleLikeComment(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	commentID, err := getCommentID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid comment ID", utils.ErrorTypeAlert)
		return
	}

	if CheckCommentReactionExists(commentID, userID) {
		if err := DeleteCommentReaction(commentID, userID); err != nil {
			utils.SQLiteErrorTarget(err, "HandleLikeComment (DeleteCommentReaction)")
			utils.InternalServerError(w)
			return
		}
		utils.WriteSuccess(w, http.StatusOK, map[string]interface{}{
			"message":   "Like removed successfully.",
			"commentId": commentID,
		})
		return
	}

	if err := CreateCommentReaction(commentID, userID, ReactionLike); err != nil {
		utils.SQLiteErrorTarget(err, "HandleLikeComment (CreateCommentReaction)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, map[string]interface{}{
		"message":   "Comment liked successfully.",
		"commentId": commentID,
	})
}

// HandleUnlikeComment handles DELETE /api/v1/comments/{comment_id}/like
func HandleUnlikeComment(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserIdFromContext(r)
	commentID, err := getCommentID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid comment ID", utils.ErrorTypeAlert)
		return
	}

	if err := DeleteCommentReaction(commentID, userID); err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "Like not found")
			return
		}
		utils.SQLiteErrorTarget(err, "HandleUnlikeComment (DeleteCommentReaction)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, map[string]interface{}{
		"message":   "Like removed successfully.",
		"commentId": commentID,
	})
}
