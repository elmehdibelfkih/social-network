package follow

import (
	"database/sql"
	"errors"
	"strings"

	"social/pkg/config"
	"social/pkg/db/database"
	"social/pkg/utils"

	"github.com/mattn/go-sqlite3"
)

func toStringPtr(ns sql.NullString) *string {
	if !ns.Valid {
		return nil
	}
	return &ns.String
}

func toInt64Ptr(ni sql.NullInt64) *int64 {
	if !ni.Valid {
		return nil
	}
	return &ni.Int64
}

func selectFollowStatus(followerId, followedId int64) (string, error) {
	var status string

	err := config.DB.QueryRow(
		SELECT_FOLLOW_STATUS_QUERY,
		followerId, followedId,
	).Scan(&status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil
		}

		if sqliteErr, ok := err.(sqlite3.Error); ok && sqliteErr.Code == sqlite3.ErrError {
			if strings.Contains(sqliteErr.Error(), "no such column") {
				return "", nil
			}
		}

		utils.SQLiteErrorTarget(err, SELECT_FOLLOW_STATUS_QUERY)
		return "", err
	}

	return status, nil
}

func userExists(userId int64) (bool, error) {
	var exists bool
	err := config.DB.QueryRow(
		USER_EXISTS_QUERY,
		userId,
	).Scan(&exists)
	if err != nil {
		utils.SQLiteErrorTarget(err, USER_EXISTS_QUERY)
		return false, err
	}
	return exists, nil
}

func isPublic(userId int64) (bool, error) {
	var isPublic bool
	err := config.DB.QueryRow(
		IS_USER_PROFILE_PUBLIC_QUERY,
		userId,
	).Scan(&isPublic)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		utils.SQLiteErrorTarget(err, IS_USER_PROFILE_PUBLIC_QUERY)
		return false, err
	}
	return isPublic, nil
}

func followUser(followerId, followedId int64) error {
	// todo: check if already ixist a notification
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(FOLLOW_REQUEST_QUERY,
			followerId, followedId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, FOLLOW_REQUEST_QUERY)
			return err
		}

		status, err := selectFollowStatus(followerId, followedId)
		if err != nil {
			return err
		}

		n := followNotification(followerId, followedId, status)
		_, err = tx.Exec(INSERT_NOTIFICATION,
			n.id, n.UserId, n.Type, n.ReferenceType, n.ReferenceId, n.Content,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_NOTIFICATION)
			return err
		}

		isPublic, err := isPublic(followedId)
		if err != nil {
			utils.SQLiteErrorTarget(err, INSERT_NOTIFICATION)
			return err
		}

		if !isPublic {
			return nil
		}

		// Update followers count for the followed user
		counter := followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followedId, database.FOLLOWERS_ENTITY_NAME, "increment")
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.USER_ENTITY_TYPE)
			return err
		}

		// Update followees count for the follower user
		counter = followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followerId, database.FOLLOWEES_ENTITY_NAME, "increment")
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, database.USER_ENTITY_TYPE)
			return err
		}

		return nil
	})
}

func unfollowUser(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(UNFOLLOW_REQUEST_QUERY,
			followerId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}

		// Update followers count for the followed user
		counter := followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followedId, database.FOLLOWERS_ENTITY_NAME, "decrement")
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}

		// Update followees count for the follower user
		counter = followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followerId, database.FOLLOWEES_ENTITY_NAME, "decrement")
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}

		return nil
	})
}
func GetFollowersByUserID(targetUser int64, userID int64) ([]UserFollowItem, error) {

	rows, err := config.DB.Query(GET_FOLLOWERS_QUERY, userID, userID, userID)
	if err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOWERS_QUERY)
		return nil, err
	}
	defer rows.Close()

	var followers []UserFollowItem

	for rows.Next() {
		var (
			userId    int64
			status    sql.NullString
			nickname  sql.NullString
			firstName string
			lastName  string
			avatarId  sql.NullInt64
			privacy   string
			chatId    sql.NullInt64
		)

		if err := rows.Scan(
			&userId,
			&status,
			&nickname,
			&firstName,
			&lastName,
			&avatarId,
			&privacy,
			&chatId,
		); err != nil {
			utils.SQLiteErrorTarget(err, GET_FOLLOWERS_QUERY)
			return nil, err
		}

		stats, err := getState(userId)
		if err != nil {
			utils.SQLiteErrorTarget(err, "getState")
			return nil, err
		}

		follower := UserFollowItem{
			UserId:    userId,
			Status:    toStringPtr(status),
			Nickname:  toStringPtr(nickname),
			FirstName: firstName,
			LastName:  lastName,
			AvatarId:  toInt64Ptr(avatarId),
			Privacy:   privacy,
			ChatId:    toInt64Ptr(chatId),
			Stats:     stats,
		}

		followers = append(followers, follower)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOWERS_QUERY)
		return nil, err
	}

	return followers, nil
}

func GetFolloweesByUserID(userID int64) ([]UserFollowItem, error) {
	rows, err := config.DB.Query(GET_FOLLOWEES_QUERY, userID, userID)
	if err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOWEES_QUERY)
		return nil, err
	}
	defer rows.Close()

	var followees []UserFollowItem

	for rows.Next() {
		var (
			userId    int64
			status    string
			nickname  sql.NullString
			firstName string
			lastName  string
			avatarId  sql.NullInt64
			privacy   string
			chatId    sql.NullInt64
		)

		err = rows.Scan(&userId, &status, &nickname, &firstName, &lastName, &avatarId, &privacy, &chatId)
		if err != nil {
			utils.SQLiteErrorTarget(err, GET_FOLLOWEES_QUERY)
			return nil, err
		}

		// Populate Stats
		stats, err := getState(userId)
		if err != nil {
			utils.SQLiteErrorTarget(err, "getState")
			return nil, err
		}

		followee := UserFollowItem{
			UserId:    userId,
			Status:    &status,
			Nickname:  toStringPtr(nickname),
			FirstName: firstName,
			LastName:  lastName,
			AvatarId:  toInt64Ptr(avatarId),
			Privacy:   privacy,
			ChatId:    toInt64Ptr(chatId),
			Stats:     stats,
		}

		followees = append(followees, followee)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOWEES_QUERY)
		return nil, err
	}

	return followees, nil
}

func GetFollowRequestByUserID(userID int64) ([]UserFollowItem, error) {
	rows, err := config.DB.Query(GET_FOLLOW_REQUEST_QUERY, userID, userID)
	if err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOW_REQUEST_QUERY)
		return nil, err
	}
	defer rows.Close()

	var followRequests []UserFollowItem

	for rows.Next() {
		var (
			userId    int64
			status    string
			nickname  sql.NullString
			firstName string
			lastName  string
			avatarId  sql.NullInt64
			privacy   string
			chatId    sql.NullInt64
		)

		err = rows.Scan(&userId, &status, &nickname, &firstName, &lastName, &avatarId, &privacy, &chatId)
		if err != nil {
			utils.SQLiteErrorTarget(err, GET_FOLLOW_REQUEST_QUERY)
			return nil, err
		}

		// Populate Stats
		stats, err := getState(userId)
		if err != nil {
			utils.SQLiteErrorTarget(err, "getState")
			return nil, err
		}

		followRequest := UserFollowItem{
			UserId:    userId,
			Status:    &status,
			Nickname:  toStringPtr(nickname),
			FirstName: firstName,
			LastName:  lastName,
			AvatarId:  toInt64Ptr(avatarId),
			Privacy:   privacy,
			ChatId:    toInt64Ptr(chatId),
			Stats:     stats,
		}

		followRequests = append(followRequests, followRequest)
	}

	if err = rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, GET_FOLLOW_REQUEST_QUERY)
		return nil, err
	}

	return followRequests, nil
}

func getState(userId int64) (UserProfileStatsJson, error) {
	var ret UserProfileStatsJson

	val, err := database.GetCounter(database.DBCounterGetter{
		CounterName: "followers",
		EntityType:  "user",
		EntityID:    userId,
	})
	if err != nil {
		return ret, err
	}
	ret.FollowersCount = val

	val, err = database.GetCounter(database.DBCounterGetter{
		CounterName: "followees",
		EntityType:  "user",
		EntityID:    userId,
	})
	if err != nil {
		return ret, err
	}
	ret.FollowingCount = val

	val, err = database.GetCounter(database.DBCounterGetter{
		CounterName: "posts",
		EntityType:  "user",
		EntityID:    userId,
	})
	if err != nil {
		return ret, err
	}
	ret.PostsCount = val
	return ret, nil
}

func acceptFollowRequest(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(ACCEPT_FOLLOW_REQUEST_QUERY,
			followerId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, ACCEPT_FOLLOW_REQUEST_QUERY)
			return err
		}

		// Update followers count for the followed user
		counter := followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followedId, database.FOLLOWERS_ENTITY_NAME, "increment")
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}

		// Update followees count for the follower user
		counter = followUnfollowUpdateCounterStruct(database.USER_ENTITY_TYPE, followerId, database.FOLLOWEES_ENTITY_NAME, "increment")
		err = database.UpdateCounter(tx, counter)
		if err != nil {
			utils.SQLiteErrorTarget(err, UNFOLLOW_REQUEST_QUERY)
			return err
		}

		return nil
	})
}

func declineFollowRequest(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		_, err := tx.Exec(DECLINE_FOLLOW_REQUEST_QUERY,
			followerId, followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, DECLINE_FOLLOW_REQUEST_QUERY)
			return err
		}
		return nil
	})
}
