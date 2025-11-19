package feed

import (
	"database/sql"
	"social/pkg/config"
	"social/pkg/utils"
)

func GetPersonalFeed(userId int64, page, limit int) ([]FeedPostResponseJson, error) {
	offset := (page - 1) * limit
	rows, err := config.DB.Query(SELECT_PERSONAL_FEED, userId, userId, userId, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_PERSONAL_FEED)
		return nil, err
	}
	defer rows.Close()

	var posts []FeedPostResponseJson
	for rows.Next() {
		var post FeedPostResponseJson
		var authorNickname sql.NullString
		var groupId sql.NullInt64

		err := rows.Scan(
			&post.PostId,
			&post.AuthorId,
			&authorNickname,
			&post.AuthorLastName,
			&post.AuthorFirstName,
			&post.Content,
			&post.Privacy,
			&groupId,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_PERSONAL_FEED)
			return nil, err
		}

		// Handle nullable fields
		if authorNickname.Valid {
			post.AuthorNickname = &authorNickname.String
		}
		if groupId.Valid {
			post.GroupId = &groupId.Int64
		}

		// Get additional data for this post
		post.IsLikedByUser = checkUserLikedPost(post.PostId, userId)
		post.Stats.ReactionCount = getPostReactionCount(post.PostId)
		post.Stats.CommentCount = getPostCommentCount(post.PostId)

		// Get media IDs
		mediaIds, err := GetPostMediaIds(post.PostId)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_POST_MEDIA_IDS)
			return nil, err
		}
		if len(mediaIds) > 0 {
			post.MediaIds = mediaIds
		} else {
			post.MediaIds = nil
		}

		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, SELECT_PERSONAL_FEED)
		return nil, err
	}

	return posts, nil
}

// GetUserFeed retrieves posts by a specific user (respects privacy)
func GetUserFeed(viewerId, profileUserId int64, page, limit int) ([]FeedPostResponseJson, error) {
	offset := (page - 1) * limit
	rows, err := config.DB.Query(SELECT_USER_FEED, profileUserId, profileUserId, viewerId, viewerId, limit, offset)
	if err != nil {
		utils.SQLiteErrorTarget(err, SELECT_USER_FEED)
		return nil, err
	}
	defer rows.Close()

	var posts []FeedPostResponseJson
	for rows.Next() {
		var post FeedPostResponseJson
		var authorNickname sql.NullString
		var groupId sql.NullInt64

		err := rows.Scan(
			&post.PostId,
			&post.AuthorId,
			&authorNickname,
			&post.AuthorLastName,
			&post.AuthorFirstName,
			&post.Content,
			&post.Privacy,
			&groupId,
			&post.CreatedAt,
			&post.UpdatedAt,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_USER_FEED)
			return nil, err
		}

		// Handle nullable fields
		if authorNickname.Valid {
			post.AuthorNickname = &authorNickname.String
		}
		if groupId.Valid {
			post.GroupId = &groupId.Int64
		}

		// Get additional data for this post
		post.IsLikedByUser = checkUserLikedPost(post.PostId, viewerId)
		post.Stats.ReactionCount = getPostReactionCount(post.PostId)
		post.Stats.CommentCount = getPostCommentCount(post.PostId)

		// Get media IDs
		mediaIds, err := GetPostMediaIds(post.PostId)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_POST_MEDIA_IDS)
			return nil, err
		}
		if len(mediaIds) > 0 {
			post.MediaIds = mediaIds
		} else {
			post.MediaIds = nil
		}

		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, SELECT_USER_FEED)
		return nil, err
	}

	return posts, nil
}

// checkUserLikedPost checks if user liked a post
func checkUserLikedPost(postId, userId int64) bool {
	var exists int
	err := config.DB.QueryRow(SELECT_USER_LIKED_POST, postId, userId).Scan(&exists)
	return err == nil
}

// getPostReactionCount gets reaction count for a post
func getPostReactionCount(postId int64) int64 {
	var count int64
	err := config.DB.QueryRow(SELECT_POST_REACTION_COUNT, postId).Scan(&count)
	if err != nil {
		return 0
	}
	return count
}

// getPostCommentCount gets comment count for a post
func getPostCommentCount(postId int64) int64 {
	var count int64
	err := config.DB.QueryRow(SELECT_POST_COMMENT_COUNT, postId).Scan(&count)
	if err != nil {
		return 0
	}
	return count
}

// GetPostMediaIds retrieves all media IDs for a post
func GetPostMediaIds(postId int64) ([]int64, error) {
	rows, err := config.DB.Query(SELECT_POST_MEDIA_IDS, postId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mediaIds []int64
	for rows.Next() {
		var mediaId int64
		if err := rows.Scan(&mediaId); err != nil {
			return nil, err
		}
		mediaIds = append(mediaIds, mediaId)
	}

	return mediaIds, rows.Err()
}
