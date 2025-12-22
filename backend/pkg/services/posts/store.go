package posts

import (
	"database/sql"
	"fmt"
	"time"

	socket "social/pkg/app/sockets"
	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"

	"github.com/mattn/go-sqlite3"
)

// CreatePost creates a new post in the database
func CreatePost(post *Post) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(QUERY_CREATE_POST,
			post.ID,
			post.AuthorID,
			post.GroupID,
			utils.TrimAny(post.Content),
			post.Privacy,
			post.CreatedAt,
			post.UpdatedAt,
		)
		if err != nil {
			if e, ok := err.(sqlite3.Error); ok && e.Code == sqlite3.ErrConstraint {
				return fmt.Errorf("constraint error: %w", err)
			}
			utils.SQLiteErrorTarget(err, "CreatePost")
			return fmt.Errorf("failed to create post: %w", err)
		}

		counter := addRemovePostActionsUpdateCounterStruct(database.USER_ENTITY_TYPE, post.AuthorID, database.POSTS_ENTITY_NAME, database.ACTION_INCREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.USER_ENTITY_TYPE)
			return err
		}

		if post.GroupID != nil {
			counter = addRemovePostActionsUpdateCounterStruct(database.GROUP_ENTITY_TYPE, *post.GroupID, database.POSTS_ENTITY_NAME, database.ACTION_INCREMENT)
			err = database.UpdateCounter(tx, counter)
			if err != nil {
				utils.SQLiteErrorTarget(err, database.GROUP_ENTITY_TYPE)
				return err
			}
		}

		return nil
	})
	return err
}

// GetPostByID retrieves a post by its ID
func GetPostByID(postID int64) (*Post, error) {
	post := &Post{}
	err := config.DB.QueryRow(QUERY_GET_POST_BY_ID, postID).Scan(
		&post.ID,
		&post.AuthorID,
		&post.GroupID,
		&post.Content,
		&post.Privacy,
		&post.CreatedAt,
		&post.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		utils.SQLiteErrorTarget(err, "GetPostByID")
		return nil, fmt.Errorf("failed to get post: %w", err)
	}
	return post, nil
}

// UpdatePost updates an existing post
func UpdatePost(postID, authorID int64, content, privacy string, updatedAt string) error {
	result, err := config.DB.Exec(QUERY_UPDATE_POST, utils.TrimAny(content), privacy, updatedAt, postID, authorID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "UpdatePost")
		return fmt.Errorf("failed to update post: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// DeletePost deletes a post by ID and author ID
func DeletePost(postID, authorID int64) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		post, err := GetPostByID(postID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "DeletePost (delete media)")
			return err
		}

		// Delete post media associations
		_, err = tx.Exec(QUERY_DELETE_POST_MEDIA, postID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "DeletePost (delete media)")
			return err
		}

		_, err = tx.Exec(QUERY_DELETE_POST_ALLOWED_VIEWERS, postID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "DeletePost (delete allowed viewers)")
			return err
		}

		// Delete the post
		result, err := tx.Exec(QUERY_DELETE_POST, postID, authorID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "DeletePost")
			return err
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			return err
		}

		if rowsAffected == 0 {
			return sql.ErrNoRows
		}

		// Decrement posts_count
		if err := database.UpdateCounter(tx, database.DBCounterSetter{
			CounterName: database.POSTS_ENTITY_NAME,
			EntityType:  database.USER_ENTITY_TYPE,
			EntityID:    post.AuthorID,
			Action:      database.ACTION_DECREMENT,
		}); err != nil {
			return err
		}

		if post.GroupID != nil {
			if err := database.UpdateCounter(tx, database.DBCounterSetter{
				CounterName: database.POSTS_ENTITY_NAME,
				EntityType:  database.GROUP_ENTITY_TYPE,
				EntityID:    *post.GroupID,
				Action:      database.ACTION_DECREMENT,
			}); err != nil {
				return err
			}
		}

		return nil
	})

	return err
}

// GetUserPosts retrieves posts for a specific user with pagination
func GetUserPosts(userID int64, limit, offset int) ([]Post, int, error) {
	var posts []Post
	var totalPosts int

	// Get total count
	err := config.DB.QueryRow(QUERY_COUNT_USER_POSTS, userID).Scan(&totalPosts)
	if err != nil {
		if err == sql.ErrNoRows {
			totalPosts = 0 // No counter row = 0 posts
		} else {
			utils.SQLiteErrorTarget(err, "GetUserPosts (count)")
			return nil, 0, fmt.Errorf("failed to count posts: %w", err)
		}
	}

	// Get posts
	rows, err := config.DB.Query(QUERY_GET_USER_POSTS, userID, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, "GetUserPosts")
		return nil, 0, fmt.Errorf("failed to get posts: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		err := rows.Scan(
			&post.ID,
			&post.AuthorID,
			&post.GroupID,
			&post.Content,
			&post.Privacy,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, "GetUserPosts (scan)")
			return nil, 0, err
		}
		posts = append(posts, post)
	}

	return posts, totalPosts, nil
}

// InsertPostMedia inserts media associations for a post
func InsertPostMedia(postID int64, mediaIDs []int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		for i, mediaID := range mediaIDs {
			_, err := tx.Exec(QUERY_INSERT_POST_MEDIA, postID, mediaID, i)
			if err != nil {
				utils.SQLiteErrorTarget(err, "InsertPostMedia")
				return err
			}
		}
		return nil
	})
}

// GetPostMediaIDs retrieves media IDs for a post
func GetPostMediaIDs(postID int64) ([]int64, error) {
	rows, err := config.DB.Query(QUERY_GET_POST_MEDIA_IDS, postID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "GetPostMediaIDs")
		return nil, err
	}
	defer rows.Close()

	var mediaIDs []int64
	for rows.Next() {
		var mediaID int64
		if err := rows.Scan(&mediaID); err != nil {
			utils.SQLiteErrorTarget(err, "GetPostMediaIDs (scan)")
			return nil, err
		}
		mediaIDs = append(mediaIDs, mediaID)
	}

	return mediaIDs, nil
}

// InsertPostAllowedViewers inserts allowed viewers for a post
func InsertPostAllowedViewers(postID int64, userIDs []int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		for _, userID := range userIDs {
			_, err := tx.Exec(QUERY_INSERT_POST_ALLOWED_VIEWER, postID, userID)
			if err != nil {
				utils.SQLiteErrorTarget(err, "InsertPostAllowedViewers")
				return err
			}
		}
		return nil
	})
}

// GetPostAllowedViewers retrieves allowed viewer IDs for a post
func GetPostAllowedViewers(postID int64) ([]int64, error) {
	rows, err := config.DB.Query(QUERY_GET_POST_ALLOWED_VIEWERS, postID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "GetPostAllowedViewers")
		return nil, err
	}
	defer rows.Close()

	var userIDs []int64
	for rows.Next() {
		var userID int64
		if err := rows.Scan(&userID); err != nil {
			utils.SQLiteErrorTarget(err, "GetPostAllowedViewers (scan)")
			return nil, err
		}
		userIDs = append(userIDs, userID)
	}

	return userIDs, nil
}

// CreateComment creates a new comment
func CreateComment(comment *Comment) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		// Get post author ID
		var postAuthorID int64
		err := tx.QueryRow(QUERY_GET_POST_AUTHORID, comment.PostID).Scan(&postAuthorID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_GET_POST_AUTHORID)
			return fmt.Errorf("failed to get post author: %w", err)
		}

		_, err = tx.Exec(QUERY_CREATE_COMMENT,
			comment.ID,
			comment.PostID,
			comment.AuthorID,
			nil, // parent_id
			comment.Content,
			comment.CreatedAt,
			comment.UpdatedAt,
		)
		if err != nil {
			if e, ok := err.(sqlite3.Error); ok && e.Code == sqlite3.ErrConstraint {
				return fmt.Errorf("constraint error: %w", err)
			}
			utils.SQLiteErrorTarget(err, "CreateComment")
			return fmt.Errorf("failed to create comment: %w", err)
		}

		err = socket.InsertNotification(socket.Notification{
			NotificationId: utils.GenerateID(),
			UserId:         postAuthorID,
			Type:           "post_commented",
			RefrenceId:     comment.PostID,
			RefrenceType:   "post",
			Content:        "new Comment",
			Status:         "active",
		}, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, "failed to insert notification")
		}

		// Increment post's comments_count
		counter := addRemovePostActionsUpdateCounterStruct(database.POST_ENTITY_TYPE, comment.PostID, database.COMMENTS_ENTITY_NAME, database.ACTION_INCREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.POST_ENTITY_TYPE)
			return err
		}

		// Increment post author's comments_count (comments received)
		counter = addRemovePostActionsUpdateCounterStruct(database.USER_ENTITY_TYPE, postAuthorID, database.COMMENTS_ENTITY_NAME, database.ACTION_INCREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.USER_ENTITY_TYPE)
			return err
		}

		return nil
	})
	return err
}

// GetCommentByID retrieves a comment by its ID
func GetCommentByID(commentID int64) (*Comment, error) {
	comment := &Comment{}
	err := config.DB.QueryRow(QUERY_GET_COMMENT_BY_ID, commentID).Scan(
		&comment.ID,
		&comment.PostID,
		&comment.AuthorID,
		&comment.Content,
		&comment.CreatedAt,
		&comment.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		utils.SQLiteErrorTarget(err, "GetCommentByID")
		return nil, fmt.Errorf("failed to get comment: %w", err)
	}
	return comment, nil
}

// DeleteComment deletes a comment
func DeleteComment(commentID, authorID int64) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		comment, err := GetCommentByID(commentID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "GET in DeleteComment")
			return fmt.Errorf("failed to delete comment: %w", err)
		}

		// Get post author ID
		var postAuthorID int64
		err = tx.QueryRow(QUERY_GET_POST_AUTHORID, comment.PostID).Scan(&postAuthorID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_GET_POST_AUTHORID)
			return fmt.Errorf("failed to get post author: %w", err)
		}

		result, err := tx.Exec(QUERY_DELETE_COMMENT, commentID, authorID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "DeleteComment")
			return fmt.Errorf("failed to delete comment: %w", err)
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			return err
		}

		if rowsAffected == 0 {
			return sql.ErrNoRows
		}

		// decrement post's comments_count
		if err := database.UpdateCounter(tx, database.DBCounterSetter{
			CounterName: database.COMMENTS_ENTITY_NAME,
			EntityType:  database.POST_ENTITY_TYPE,
			EntityID:    comment.PostID,
			Action:      database.ACTION_DECREMENT,
		}); err != nil {
			return err
		}

		// decrement post author's comments_count (comments received)
		if err := database.UpdateCounter(tx, database.DBCounterSetter{
			CounterName: database.COMMENTS_ENTITY_NAME,
			EntityType:  database.USER_ENTITY_TYPE,
			EntityID:    postAuthorID,
			Action:      database.ACTION_DECREMENT,
		}); err != nil {
			return err
		}
		return nil
	})
	return err
}

// GetPostComments retrieves comments for a post with pagination
func GetPostComments(postID int64, limit, offset int) ([]Comment, int, error) {
	var comments []Comment
	var totalComments int

	// Get total count
	err := config.DB.QueryRow(QUERY_COUNT_POST_COMMENTS, postID).Scan(&totalComments)
	if err != nil {
		if err == sql.ErrNoRows {
			totalComments = 0 // No counter row = 0 comments
		} else {
			utils.SQLiteErrorTarget(err, "GetPostComments (count)")
			return nil, 0, fmt.Errorf("failed to count comments: %w", err)
		}
	}

	// Get comments
	rows, err := config.DB.Query(QUERY_GET_POST_COMMENTS, postID, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, "GetPostComments")
		return nil, 0, fmt.Errorf("failed to get comments: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var comment Comment
		err := rows.Scan(
			&comment.ID,
			&comment.PostID,
			&comment.AuthorID,
			&comment.Content,
			&comment.CreatedAt,
			&comment.UpdatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, "GetPostComments (scan)")
			return nil, 0, err
		}
		comments = append(comments, comment)
	}

	return comments, totalComments, nil
}

// InsertCommentMedia inserts media associations for a comment
func InsertCommentMedia(commentID int64, mediaIDs []int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		for _, mediaID := range mediaIDs {
			_, err := tx.Exec(QUERY_INSERT_COMMENT_MEDIA, commentID, mediaID)
			if err != nil {
				utils.SQLiteErrorTarget(err, "InsertCommentMedia")
				return err
			}

		}
		return nil
	})
}

// GetCommentMediaIDs retrieves media IDs for a comment
func GetCommentMediaIDs(commentID int64) ([]int64, error) {
	rows, err := config.DB.Query(QUERY_GET_COMMENT_MEDIA_IDS, commentID)
	if err != nil {
		utils.SQLiteErrorTarget(err, "GetCommentMediaIDs")
		return nil, err
	}
	defer rows.Close()

	var mediaIDs []int64
	for rows.Next() {
		var mediaID int64
		if err := rows.Scan(&mediaID); err != nil {
			utils.SQLiteErrorTarget(err, "GetCommentMediaIDs (scan)")
			return nil, err
		}
		mediaIDs = append(mediaIDs, mediaID)
	}

	return mediaIDs, nil
}

// CreatePostReaction creates a like/dislike reaction
func CreatePostReaction(postID, userID int64, reaction string) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		// Get post author ID
		var authorID int64
		err := tx.QueryRow(QUERY_GET_POST_AUTHORID, postID).Scan(&authorID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_GET_POST_AUTHORID)
			return fmt.Errorf("failed to get post author: %w", err)
		}

		now := time.Now().Format(time.RFC3339)
		_, err = tx.Exec(QUERY_CREATE_POST_REACTION, postID, userID, reaction, now)
		if err != nil {
			if e, ok := err.(sqlite3.Error); ok && e.Code == sqlite3.ErrConstraint {
				return fmt.Errorf("reaction already exists")
			}
			utils.SQLiteErrorTarget(err, "CreatePostReaction")
			return fmt.Errorf("failed to create reaction: %w", err)
		}
		var status = "suspended"
		if status == "like" {
			status = "active"
		}
		err = socket.InsertNotification(socket.Notification{
			NotificationId: utils.GenerateID(),
			UserId:         authorID,
			Type:           "post_liked",
			RefrenceId:     postID,
			RefrenceType:   "post",
			Content:        "new reaction",
			Status:         status,
		}, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, "failed to insert notification")
		}

		// Increment post's reactions_count
		counter := addRemovePostActionsUpdateCounterStruct(database.POST_ENTITY_TYPE, postID, database.REACTIONS_ENTITY_NAME, database.ACTION_INCREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.POST_ENTITY_TYPE)
			return err
		}

		// Increment post author's reactions_count (likes received)
		counter = addRemovePostActionsUpdateCounterStruct(database.USER_ENTITY_TYPE, authorID, database.REACTIONS_ENTITY_NAME, database.ACTION_INCREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.USER_ENTITY_TYPE)
			return err
		}

		return nil
	})
	return err
}

// DeletePostReaction removes a reaction
func DeletePostReaction(postID, userID int64) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		// Get post author ID before deleting
		var authorID int64
		err := tx.QueryRow(QUERY_GET_POST_AUTHORID, postID).Scan(&authorID)
		if err != nil {
			utils.SQLiteErrorTarget(err, QUERY_GET_POST_AUTHORID)
			return fmt.Errorf("failed to get post author: %w", err)
		}

		result, err := tx.Exec(QUERY_DELETE_POST_REACTION, postID, userID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "DeletePostReaction")
			return fmt.Errorf("failed to delete reaction: %w", err)
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			return err
		}

		if rowsAffected == 0 {
			return sql.ErrNoRows
		}

		// Decrement post's reactions_count
		counter := addRemovePostActionsUpdateCounterStruct(database.POST_ENTITY_TYPE, postID, database.REACTIONS_ENTITY_NAME, database.ACTION_DECREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.POST_ENTITY_TYPE)
			return err
		}

		// Decrement post author's reactions_count (likes received)
		counter = addRemovePostActionsUpdateCounterStruct(database.USER_ENTITY_TYPE, authorID, database.REACTIONS_ENTITY_NAME, database.ACTION_DECREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.USER_ENTITY_TYPE)
			return err
		}

		return nil
	})
	return err
}

// CheckPostReactionExists checks if a reaction already exists
func CheckPostReactionExists(postID, userID int64) bool {
	var exists int
	err := config.DB.QueryRow(QUERY_CHECK_POST_REACTION_EXISTS, postID, userID).Scan(&exists)
	return err == nil
}

func GetAuthorDetails(authorID int64) (*AuthorDetails, error) {
	var firstName, lastName sql.NullString
	var nickname sql.NullString

	err := config.DB.QueryRow(QUERY_GET_AUTHOR_DETAILS, authorID).Scan(&firstName, &lastName, &nickname)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		utils.SQLiteErrorTarget(err, "GetAuthorDetails")
		return nil, fmt.Errorf("failed to get author details: %w", err)
	}

	details := &AuthorDetails{}
	if firstName.Valid {
		details.FirstName = firstName.String
	}
	if lastName.Valid {
		details.LastName = lastName.String
	}
	if nickname.Valid {
		details.Nickname = nickname.String
	}

	return details, nil
}

// CreateCommentReaction creates a like reaction on a comment
func CreateCommentReaction(commentID, userID int64, reaction string) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		now := time.Now().Format(time.RFC3339)
		_, err := tx.Exec(QUERY_CREATE_COMMENT_REACTION, commentID, userID, reaction, now)
		if err != nil {
			if e, ok := err.(sqlite3.Error); ok && e.Code == sqlite3.ErrConstraint {
				return fmt.Errorf("reaction already exists")
			}
			utils.SQLiteErrorTarget(err, "CreateCommentReaction")
			return fmt.Errorf("failed to create comment reaction: %w", err)
		}

		counter := addRemovePostActionsUpdateCounterStruct(database.COMMENT_ENTITY_TYPE, commentID, database.REACTIONS_ENTITY_NAME, database.ACTION_INCREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.COMMENT_ENTITY_TYPE)
			return err
		}

		return nil
	})
	return err
}

// DeleteCommentReaction removes a reaction from a comment
func DeleteCommentReaction(commentID, userID int64) error {
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		result, err := tx.Exec(QUERY_DELETE_COMMENT_REACTION, commentID, userID)
		if err != nil {
			utils.SQLiteErrorTarget(err, "DeleteCommentReaction")
			return fmt.Errorf("failed to delete comment reaction: %w", err)
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			return err
		}

		if rowsAffected == 0 {
			return sql.ErrNoRows
		}

		counter := addRemovePostActionsUpdateCounterStruct(database.COMMENT_ENTITY_TYPE, commentID, database.REACTIONS_ENTITY_NAME, database.ACTION_DECREMENT)
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.COMMENT_ENTITY_TYPE)
			return err
		}

		return nil
	})
	return err
}

// CheckCommentReactionExists checks if a reaction already exists on a comment
func CheckCommentReactionExists(commentID, userID int64) bool {
	var exists int
	err := config.DB.QueryRow(QUERY_CHECK_COMMENT_REACTION_EXISTS, commentID, userID).Scan(&exists)
	return err == nil
}

// GetCommentLikeCount returns the number of likes on a comment
func GetCommentLikeCount(commentID int64) int {
	var count int
	err := config.DB.QueryRow(QUERY_COUNT_COMMENT_LIKES, commentID).Scan(&count)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0 // No counter row = 0 likes
		}
		return 0
	}
	return count
}

// GetPostStats returns reaction and comment counts for a post
func GetPostStats(postID int64) (Stats, error) {
	var stats Stats

	// Get reaction count
	err := config.DB.QueryRow(QUERY_COUNT_POST_REACTIONS, postID).Scan(&stats.ReactionCount)
	if err != nil {
		stats.ReactionCount = 0
	}

	// Get comment count
	err = config.DB.QueryRow(QUERY_COUNT_POST_COMMENTS, postID).Scan(&stats.CommentCount)
	if err != nil {
		stats.CommentCount = 0
	}

	return stats, nil
}
