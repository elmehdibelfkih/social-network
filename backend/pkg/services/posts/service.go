package posts

import (
	"database/sql"
	"fmt"
	"net/http"
	"social/pkg/config"
	"social/pkg/utils"
	"strconv"
)

// getPostID extracts and validates post_id from URL path
func getPostID(r *http.Request) (int64, error) {
	postIDStr := r.PathValue("post_id")
	if postIDStr == "" {
		return 0, fmt.Errorf("the 'post_id' parameter is required")
	}
	id, err := strconv.ParseInt(postIDStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("the 'post_id' must be a valid integer")
	}
	return id, nil
}

// getUserID extracts and validates user_id from URL path
func getUserID(r *http.Request) (int64, error) {
	userIDStr := r.PathValue("user_id")
	if userIDStr == "" {
		return 0, fmt.Errorf("the 'user_id' parameter is required")
	}
	id, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("the 'user_id' must be a valid integer")
	}
	return id, nil
}

// getCommentID extracts and validates comment_id from URL path
func getCommentID(r *http.Request) (int64, error) {
	commentIDStr := r.PathValue("comment_id")
	if commentIDStr == "" {
		return 0, fmt.Errorf("the 'comment_id' parameter is required")
	}
	id, err := strconv.ParseInt(commentIDStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("the 'comment_id' must be a valid integer")
	}
	return id, nil
}

// getPaginationParams extracts page and limit from query parameters
func getPaginationParams(r *http.Request) (int, int, int) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page := DefaultPage
	limit := DefaultLimit

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= MaxLimit {
			limit = l
		}
	}

	offset := (page - 1) * limit
	return page, limit, offset
}

// canViewPost checks if a user can view a specific post
func canViewPost(requesterID, postID int64) bool {
	post, err := GetPostByID(postID)
	if err != nil {
		if err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, "canViewPost (GetPostByID)")
		}
		return false
	}

	// Author can always view their own post
	if post.AuthorID == requesterID {
		return true
	}

	// Check privacy level
	switch post.Privacy {
	case PrivacyPublic:
		return true

	case PrivacyFollowers:
		return checkFollowStatus(requesterID, post.AuthorID)

	case PrivacyPrivate:
		return false

	case PrivacyRestricted:
		return isUserInAllowedList(requesterID, postID)

	case PrivacyGroup:
		if post.GroupID == nil {
			return false
		}
		return isGroupMember(requesterID, *post.GroupID)

	default:
		return false
	}
}

// canEditPost checks if a user can edit a specific post
func canEditPost(requesterID, postID int64) bool {
	post, err := GetPostByID(postID)
	if err != nil {
		return false
	}
	return post.AuthorID == requesterID
}

// canDeletePost checks if a user can delete a specific post
func canDeletePost(requesterID, postID int64) bool {
	post, err := GetPostByID(postID)
	if err != nil {
		return false
	}
	return post.AuthorID == requesterID
}

// canDeleteComment checks if a user can delete a specific comment
func canDeleteComment(requesterID, commentID int64) bool {
	comment, err := GetCommentByID(commentID)
	if err != nil {
		return false
	}

	// User can delete their own comment
	if comment.AuthorID == requesterID {
		return true
	}

	// Post author can delete comments on their post
	post, err := GetPostByID(comment.PostID)
	if err != nil {
		return false
	}
	return post.AuthorID == requesterID
}

// checkFollowStatus checks if requester follows the author
func checkFollowStatus(followerID, followedID int64) bool {
	var exists int
	err := config.DB.QueryRow(QUERY_CHECK_FOLLOW_STATUS, followerID, followedID).Scan(&exists)
	if err != nil {
		if err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, "checkFollowStatus")
		}
		return false
	}
	return true
}

// isGroupMember checks if user is a member of the group
func isGroupMember(userID, groupID int64) bool {
	var exists int
	err := config.DB.QueryRow(QUERY_CHECK_GROUP_MEMBERSHIP, groupID, userID).Scan(&exists)
	if err != nil {
		if err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, "isGroupMember")
		}
		return false
	}
	return true
}

// isUserInAllowedList checks if user is in the post's allowed viewers list
func isUserInAllowedList(userID, postID int64) bool {
	var exists int
	err := config.DB.QueryRow(QUERY_CHECK_POST_ALLOWED_VIEWER, postID, userID).Scan(&exists)
	if err != nil {
		if err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, "isUserInAllowedList")
		}
		return false
	}
	return true
}

// canViewUserPosts checks if requester can view target user's posts
func canViewUserPosts(requesterID, targetUserID int64) bool {
	// User can always view their own posts
	if requesterID == targetUserID {
		return true
	}

	// Check target user's privacy setting
	var privacy string
	err := config.DB.QueryRow(QUERY_GET_USER_PRIVACY, targetUserID).Scan(&privacy)
	if err != nil {
		if err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, "canViewUserPosts")
		}
		return false
	}

	if privacy == "public" {
		return true
	}

	// For private profiles, check if requester follows the target
	return checkFollowStatus(requesterID, targetUserID)
}

// validatePrivacy checks if the privacy value is valid
func validatePrivacy(privacy string) bool {
	return AllowedPrivacy[privacy]
}

// validateReaction checks if the reaction value is valid
func validateReaction(reaction string) bool {
	return AllowedReactions[reaction]
}

// buildPostResponse builds a complete post response with media and allowed list
func buildPostResponse(post *Post) (*GetPostResponse, error) {
	// Get author nickname
	nickname, err := GetAuthorNickname(post.AuthorID)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Get media IDs
	mediaIDs, err := GetPostMediaIDs(post.ID)
	if err != nil {
		return nil, err
	}
	if mediaIDs == nil {
		mediaIDs = []int64{}
	}

	// Get allowed viewers
	allowedList, err := GetPostAllowedViewers(post.ID)
	if err != nil {
		return nil, err
	}
	if allowedList == nil {
		allowedList = []int64{}
	}

	return &GetPostResponse{
		PostID:         post.ID,
		AuthorID:       post.AuthorID,
		AuthorNickname: nickname,
		Content:        post.Content,
		MediaIDs:       mediaIDs,
		Privacy:        post.Privacy,
		GroupID:        post.GroupID,
		AllowedList:    allowedList,
		CreatedAt:      post.CreatedAt,
		UpdatedAt:      post.UpdatedAt,
	}, nil
}

// buildCommentResponse builds a complete comment response with media
func buildCommentResponse(comment *Comment) (*CommentResponse, error) {
	// Get author nickname
	nickname, err := GetAuthorNickname(comment.AuthorID)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Get media IDs
	mediaIDs, err := GetCommentMediaIDs(comment.ID)
	if err != nil {
		return nil, err
	}
	if mediaIDs == nil {
		mediaIDs = []int64{}
	}

	return &CommentResponse{
		CommentID:      comment.ID,
		AuthorID:       comment.AuthorID,
		AuthorNickname: nickname,
		Content:        comment.Content,
		MediaIDs:       mediaIDs,
		CreatedAt:      comment.CreatedAt,
		UpdatedAt:      comment.UpdatedAt,
	}, nil
}

// filterVisiblePosts filters posts based on requester's permissions
func filterVisiblePosts(requesterID int64, posts []Post) []Post {
	var visiblePosts []Post
	for _, post := range posts {
		if canViewPost(requesterID, post.ID) {
			visiblePosts = append(visiblePosts, post)
		}
	}
	return visiblePosts
}