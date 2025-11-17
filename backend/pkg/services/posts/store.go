package posts

import (
	"database/sql"
	"fmt"
	"time"

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
			post.Content,
			post.Privacy,
			post.CreatedAt,
			post.UpdatedAt,
			post.Pinned,
		)
		if err != nil {
			if e, ok := err.(sqlite3.Error); ok && e.Code == sqlite3.ErrConstraint {
				return fmt.Errorf("constraint error: %w", err)
			}
			utils.SQLiteErrorTarget(err, "CreatePost")
			return fmt.Errorf("failed to create post: %w", err)
		}

		// Increment posts_count
		if err := database.UpdateCounter(tx, database.DBCounterSetter{
			CounterName: database.POSTS_ENTITY_NAME,
			EntityType:  database.USER_ENTITY_TYPE,
			EntityID:    post.AuthorID,
			Action:      database.ACTION_INCREMENT,
		}); err != nil {
			return err
		}

		if post.GroupID != nil {
			if err := database.UpdateCounter(tx, database.DBCounterSetter{
				CounterName: database.POSTS_ENTITY_NAME,
				EntityType:  database.GROUP_ENTITY_TYPE,
				EntityID:    *post.GroupID,
				Action:      database.ACTION_INCREMENT,
			}); err != nil {
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
		&post.Pinned,
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
func UpdatePost(postID, authorID int64, content, privacy string, updatedAt time.Time) error {
	result, err := config.DB.Exec(QUERY_UPDATE_POST, content, privacy, updatedAt, postID, authorID)
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
		utils.SQLiteErrorTarget(err, "GetUserPosts (count)")
		return nil, 0, fmt.Errorf("failed to count posts: %w", err)
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
			&post.Pinned,
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
		now := time.Now()
		for _, userID := range userIDs {
			_, err := tx.Exec(QUERY_INSERT_POST_ALLOWED_VIEWER, postID, userID, now)
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
		_, err := tx.Exec(QUERY_CREATE_COMMENT,
			comment.ID,
			comment.PostID,
			comment.AuthorID,
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

		// Increment post's comments_count
		if err := database.UpdateCounter(tx, database.DBCounterSetter{
			CounterName: database.COMMENTS_ENTITY_NAME,
			EntityType:  database.POST_ENTITY_TYPE,
			EntityID:    comment.PostID,
			Action:      database.ACTION_INCREMENT,
		}); err != nil {
			return err
		}

		// Increment user's comments_count
		if err := database.UpdateCounter(tx, database.DBCounterSetter{
			CounterName: database.COMMENTS_ENTITY_NAME,
			EntityType:  database.USER_ENTITY_TYPE,
			EntityID:    comment.AuthorID,
			Action:      database.ACTION_INCREMENT,
		}); err != nil {
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

		// decrement user's comments_count
		if err := database.UpdateCounter(tx, database.DBCounterSetter{
			CounterName: database.COMMENTS_ENTITY_NAME,
			EntityType:  database.USER_ENTITY_TYPE,
			EntityID:    comment.AuthorID,
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
		utils.SQLiteErrorTarget(err, "GetPostComments (count)")
		return nil, 0, fmt.Errorf("failed to count comments: %w", err)
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
		for i, mediaID := range mediaIDs {
			_, err := tx.Exec(QUERY_INSERT_COMMENT_MEDIA, commentID, mediaID, i)
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
func CreatePostReaction(userID, postID int64, reaction string) error {
	now := time.Now()
	_, err := config.DB.Exec(QUERY_CREATE_POST_REACTION, userID, postID, reaction, now, now)
	if err != nil {
		if e, ok := err.(sqlite3.Error); ok && e.Code == sqlite3.ErrConstraint {
			return fmt.Errorf("reaction already exists")
		}
		utils.SQLiteErrorTarget(err, "CreatePostReaction")
		return fmt.Errorf("failed to create reaction: %w", err)
	}
	return nil
}

// DeletePostReaction removes a reaction
func DeletePostReaction(userID, postID int64) error {
	result, err := config.DB.Exec(QUERY_DELETE_POST_REACTION, userID, postID)
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

	return nil
}

// CheckPostReactionExists checks if a reaction already exists
func CheckPostReactionExists(userID, postID int64) bool {
	var exists int
	err := config.DB.QueryRow(QUERY_CHECK_POST_REACTION_EXISTS, userID, postID).Scan(&exists)
	return err == nil
}

// GetAuthorNickname retrieves the author's nickname
func GetAuthorNickname(authorID int64) (string, error) {
	var nickname sql.NullString
	err := config.DB.QueryRow(QUERY_GET_AUTHOR_NICKNAME, authorID).Scan(&nickname)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", err
		}
		utils.SQLiteErrorTarget(err, "GetAuthorNickname")
		return "", err
	}

	if nickname.Valid {
		return nickname.String, nil
	}
	return "", nil
}
