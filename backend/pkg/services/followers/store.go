package follow

import (
	"database/sql"
	"errors"
	"strings"

	socket "social/pkg/app/sockets"
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

func isGroupChat(chatId int64, tx *sql.Tx) (bool, error) {
	var groupId *int64
	err := tx.QueryRow(SELECT_CHAT_GROUP_ID, chatId).Scan(&groupId)
	if err != nil || groupId == nil {
		utils.SQLiteErrorTarget(err, SELECT_CHAT_GROUP_ID)
		return false, err
	}

	return true, nil
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
		follower, err := followBack(followerId, followedId)
		if follower {
			_, err = tx.Exec(UPDATE_FOLLOW_STATUS,
				followedId,
				followerId,
			)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_FOLLOW_STATUS)
				return err
			}
		}
		status, err := selectFollowStatus(followerId, followedId)
		if err != nil {
			return err
		}

		n := followNotification(followerId, followedId, status, "active")
		err = socket.InsertNotification(n, followerId, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, "failed to insert notificationI")
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

func followBack(followerId, followedId int64) (bool, error) {
	var exist bool
	err := config.DB.QueryRow(
		FOLLOW_BACK,
		followedId,
		followerId,
	).Scan(
		&exist,
	)
	if err != nil {
		utils.SQLiteErrorTarget(err, FOLLOW_BACK)
	}
	return exist, err
}

func createConversation(followerId, followedId int64) (int64, error) {
	var chatId int64
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		err := tx.QueryRow(SELECT_SHARED_CHATS, followerId, followedId).Scan(&chatId)
		if err != nil && err != sql.ErrNoRows {
			utils.SQLiteErrorTarget(err, SELECT_SHARED_CHATS)
			return err
		}
		if err != sql.ErrNoRows {
			_, err = tx.Exec(UPDATE_CHAT_ACTIVE, chatId)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_CHAT_ACTIVE)
				return err
			}
			socket.WSManger.AddChatUser(chatId, followerId)
			socket.WSManger.AddChatUser(chatId, followedId)
			return nil
		}
		chatId = utils.GenerateID()
		_, err = tx.Exec(
			CREATE_CHAT_ROW,
			chatId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, CREATE_CHAT_ROW)
			return err
		}
		_, err = tx.Exec(
			ADD_CHAT_PARTICIPANT,
			chatId,
			followedId,
			0,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, ADD_CHAT_PARTICIPANT)
			return err
		}
		_, err = tx.Exec(
			ADD_CHAT_PARTICIPANT,
			chatId,
			followerId,
			0,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, ADD_CHAT_PARTICIPANT)
			return err
		}
		socket.WSManger.AddChatUser(chatId, followerId)
		socket.WSManger.AddChatUser(chatId, followedId)

		return nil
	})
	return chatId, err
}

func createChatId(followerId, followedId int64) (int64, error) {
	var chatId int64
	public, err := isPublic(followedId)
	if err != nil {
		return chatId, err
	}
	if public {
		chatId, err = createConversation(followerId, followedId)
		return chatId, err
	}
	if !public {
		follower, err := followBack(followerId, followedId)
		if err != nil {
			return chatId, err
		}
		if follower {
			chatId, err = createConversation(followerId, followedId)
			return chatId, err
		}
	}
	return chatId, nil
}

func suspendConversation(followerId, followedId int64) error {
	return database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(
			SELECT_SHARED_CHATS,
			followerId,
			followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_SHARED_CHATS)
			return err
		}
		defer rows.Close()

		for rows.Next() {
			var chatId int64
			err = rows.Scan(&chatId)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_SHARED_CHATS)
				return err
			}
			isGroup, err := isGroupChat(chatId, tx)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_CHAT_GROUP_ID)
				return err
			}
			if isGroup {
				continue
			}
			_, err = tx.Exec(UPDATE_CHAT_STATUS, chatId)
			if err != nil {
				utils.SQLiteErrorTarget(err, UPDATE_CHAT_STATUS)
				return err
			}
		}
		return nil
	})
}

func SelectSharedChat(followerId, followedId int64) (*int64, error) {
	var currentChatId *int64
	err := database.WrapWithTransaction(func(tx *sql.Tx) error {
		rows, err := tx.Query(
			SELECT_SHARED_CHATS,
			followerId,
			followedId,
		)
		if err != nil {
			utils.SQLiteErrorTarget(err, SELECT_SHARED_CHATS_STATUS)
			return err
		}
		defer rows.Close()

		for rows.Next() {
			var chatId int64
			var status string
			err = rows.Scan(&chatId, &status)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_SHARED_CHATS_STATUS)
				return err
			}
			isGroup, err := isGroupChat(chatId, tx)
			if err != nil {
				utils.SQLiteErrorTarget(err, SELECT_SHARED_CHATS_STATUS)
				return err
			}
			if !isGroup {
				if status == "suspended" {
					currentChatId = nil
					break
				}
				currentChatId = &chatId
				break
			}
		}
		return err
	})

	return currentChatId, err
}

func suspendChatId(followerId, followedId int64) error {
	follow1, err := followBack(followerId, followedId)
	if err != nil {
		return err
	}
	follow2, err := followBack(followedId, followerId)
	if err != nil {
		return err
	}
	if !follow1 && !follow2 {
		return suspendConversation(followerId, followedId)
	}
	if !follow1 {
		public, err := isPublic(followedId)
		if err != nil {
			return err
		}
		if !public {
			return suspendConversation(followerId, followedId)

		}
	}
	if !follow2 {
		public, err := isPublic(followerId)
		if err != nil {

		}
		if !public {
			return suspendConversation(followerId, followedId)

		}
	}
	return nil
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

		status, err := selectFollowStatus(followerId, followedId)
		if err != nil {
			return err
		}

		n := followNotification(followerId, followedId, status, "suspended")
		err = socket.InsertNotification(n, followerId, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, "failed to insert notification")
		}

		if status != "accepted" {
			return nil
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

func getFollowList(query string, args ...any) ([]UserFollowItem, error) {
	rows, err := config.DB.Query(query, args...)
	if err != nil {
		utils.SQLiteErrorTarget(err, query)
		return nil, err
	}
	defer rows.Close()

	var items []UserFollowItem

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
			joinedAt  sql.NullString
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
			&joinedAt,
		); err != nil {
			utils.SQLiteErrorTarget(err, query)
			return nil, err
		}

		stats, err := getState(userId)
		if err != nil {
			utils.SQLiteErrorTarget(err, "getState")
			return nil, err
		}

		item := UserFollowItem{
			UserId:    userId,
			Status:    toStringPtr(status),
			Nickname:  toStringPtr(nickname),
			FirstName: firstName,
			LastName:  lastName,
			AvatarId:  toInt64Ptr(avatarId),
			Privacy:   privacy,
			ChatId:    toInt64Ptr(chatId),
			Stats:     stats,
			JoinedAt:  toStringPtr(joinedAt),
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		utils.SQLiteErrorTarget(err, query)
		return nil, err
	}

	return items, nil
}

func GetFollowersByUserID(targetUser int64, userID int64) ([]UserFollowItem, error) {
	return getFollowList(GET_FOLLOWERS_QUERY, userID, userID, targetUser)
}

func GetFolloweesByUserID(targetUser int64, userID int64) ([]UserFollowItem, error) {
	return getFollowList(GET_FOLLOWEES_QUERY, userID, userID, targetUser)
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
			joinedAt  sql.NullString
		)

		err = rows.Scan(&userId, &status, &nickname, &firstName, &lastName, &avatarId, &privacy, &chatId, &joinedAt)
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
			JoinedAt:  toStringPtr(joinedAt),
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

		n := followNotification(followerId, followedId, "accepted", "active")
		err = socket.InsertNotification(n, followerId, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, "failed to insert notificationI")
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

		n := followNotification(followerId, followedId, "declined", "active")

		err = socket.InsertNotification(n, followerId, tx)
		if err != nil {
			utils.SQLiteErrorTarget(err, "failed to insert notificationI")
		}

		return nil
	})
}
