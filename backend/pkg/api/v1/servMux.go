package v1

import (
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/app/dependencies/router"
	socket "social/pkg/app/sockets"
	"social/pkg/services/auth"
	"social/pkg/services/chat"
	"social/pkg/services/feed"
	follow "social/pkg/services/followers"
	"social/pkg/services/groups"
	"social/pkg/services/media"
	"social/pkg/services/notifications"
	"social/pkg/services/posts"
	"social/pkg/services/search"
	"social/pkg/services/users"

	"social/pkg/utils"
)

func SocialMux() *router.Router {
	socialMux := router.NewRouter()

	// auth
	socialMux.HandleFunc("POST", "/api/v1/auth/register", utils.MiddlewareChain(auth.PostRegister))
	socialMux.HandleFunc("POST", "/api/v1/auth/login", utils.MiddlewareChain(auth.PostLogin))
	socialMux.HandleFunc("POST", "/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, middleware.UserContext, middleware.AuthMiddleware))

	// groups
	socialMux.HandleFunc("POST", "/api/v1/group", utils.MiddlewareChain(groups.PostCreateGroup, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/groups/{group_id}/invite/{user_id}", utils.MiddlewareChain(groups.PostInviteMember, middleware.AuthMiddleware, groups.InvitationAvailable))
	socialMux.HandleFunc("POST", "/api/v1/groups/{group_id}/join", utils.MiddlewareChain(groups.PostJoinGroup, middleware.AuthMiddleware, groups.IsNotMemeber))
	socialMux.HandleFunc("POST", "/api/v1/groups/{group_id}/members/{user_id}/accept", utils.MiddlewareChain(groups.PostAcceptInvite, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/groups/{group_id}/members/{user_id}/decline", utils.MiddlewareChain(groups.PostDeclineInvite, middleware.AuthMiddleware))
	socialMux.HandleFunc("PUT", "/api/v1/groups/{group_id}", utils.MiddlewareChain(groups.PutUpdateGroup, middleware.AuthMiddleware, groups.IsGroupOwner))
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}", utils.MiddlewareChain(groups.GetGroupInfo, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/groups", utils.MiddlewareChain(groups.GetGroupsInfo, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}/members", utils.MiddlewareChain(groups.GetGroupMembers, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/groups/{group_id}", utils.MiddlewareChain(groups.DeleteGroup, middleware.AuthMiddleware, groups.IsGroupOwner))

	// events
	socialMux.HandleFunc("POST", "/api/v1/groups/{group_id}/events", utils.MiddlewareChain(groups.PostCreateEvent, middleware.AuthMiddleware, groups.IsMemeber))
	socialMux.HandleFunc("POST", "/api/v1/groups/{group_id}/events/{event_id}/rsvp", utils.MiddlewareChain(groups.PostEventRSVP, middleware.AuthMiddleware, groups.IsMemeber))
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}/events/{event_id}/rsvp", utils.MiddlewareChain(groups.GetEventRSVP, middleware.AuthMiddleware, groups.IsMemeber))
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}/events/{event_id}", utils.MiddlewareChain(groups.GetEventInfo, middleware.AuthMiddleware, groups.IsMemeber))
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}/events", utils.MiddlewareChain(groups.GetGroupEvents, middleware.AuthMiddleware, groups.IsMemeber))

	// chat
	socialMux.HandleFunc("POST", "/api/v1/chats/{chat_id}/messages", utils.MiddlewareChain(chat.SendMessageHandler, middleware.AuthMiddleware, chat.ChatAccessMiddleware))
	socialMux.HandleFunc("PUT", "/api/v1/chats/{chat_id}/messages", utils.MiddlewareChain(chat.SeenMessageHandler, middleware.AuthMiddleware, chat.ChatAccessMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/chats/{chat_id}/messages/{message_id}", utils.MiddlewareChain(chat.GetChatByPagination, middleware.AuthMiddleware, chat.ChatAccessMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/chats/{chat_id}/messages/{message_id}", utils.MiddlewareChain(chat.DeleteMessageHandler, middleware.AuthMiddleware, chat.ChatAccessMiddleware))
	// socialMux.HandleFunc("GET", "/api/v1/chats", utils.MiddlewareChain(chat.GetUserChats, middleware.AuthMiddleware))
	// socialMux.HandleFunc("GET", "/api/v1/chats/{chat_id}/participants", utils.MiddlewareChain(chat.GetParticipantsHandler, middleware.AuthMiddleware, chat.ChatAccessMiddleware))
	
	// media
	socialMux.HandleFunc("POST", "/api/v1/media/upload", utils.MiddlewareChain(media.HandleUploadMedia, middleware.UserContext))
	socialMux.HandleFunc("GET", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleGetMedia, middleware.AuthMiddleware, media.MediaMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleDeleteMedia, media.MediaMiddleware, middleware.AuthMiddleware))

	// follow
	socialMux.HandleFunc("POST", "/api/v1/users/{user_id}/follow", utils.MiddlewareChain(follow.FollowHandler, middleware.AuthMiddleware, follow.FollowRequestMiddleWare))
	socialMux.HandleFunc("POST", "/api/v1/users/{user_id}/unfollow", utils.MiddlewareChain(follow.UnfollowHandler, middleware.AuthMiddleware, follow.UnfollowRequestMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/followers", utils.MiddlewareChain(follow.FollowersListHandler, middleware.AuthMiddleware, follow.FollowersFolloweesListMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/following", utils.MiddlewareChain(follow.FolloweesListHandler, middleware.AuthMiddleware, follow.FollowersFolloweesListMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/follow-requests", utils.MiddlewareChain(follow.FollowRequestListHandler, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/follow-requests/{user_id}/accept", utils.MiddlewareChain(follow.AcceptFollowHandler, middleware.AuthMiddleware, follow.AcceptFollowRequestMiddleWare))
	socialMux.HandleFunc("POST", "/api/v1/follow-requests/{user_id}/decline", utils.MiddlewareChain(follow.DeclineFollowHandler, middleware.AuthMiddleware, follow.DeclineFollowRequestMiddleWare))

	// Users_Profiles
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/profile", utils.MiddlewareChain(users.GetProfile, middleware.AuthMiddleware))
	socialMux.HandleFunc("PATCH", "/api/v1/users/{user_id}/profile", utils.MiddlewareChain(users.PatchProfile, middleware.AuthMiddleware))
	socialMux.HandleFunc("PATCH", "/api/v1/users/{user_id}/password", utils.MiddlewareChain(users.PatchPassword, middleware.AuthMiddleware))
	socialMux.HandleFunc("PATCH", "/api/v1/users/{user_id}/privacy", utils.MiddlewareChain(users.PatchPrivacy, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/stats", utils.MiddlewareChain(users.GetStats, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/media/{media_id} ", utils.MiddlewareChain(media.HandleDeleteMedia, media.MediaMiddleware, middleware.AuthMiddleware))

	// Posts
	socialMux.HandleFunc("POST", "/api/v1/posts", utils.MiddlewareChain(posts.HandleCreatePost, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/posts/{post_id}", utils.MiddlewareChain(posts.HandleGetPost, middleware.UserContext, middleware.AuthMiddleware, posts.PostViewMiddleware))
	socialMux.HandleFunc("PUT", "/api/v1/posts/{post_id}", utils.MiddlewareChain(posts.HandleUpdatePost, middleware.UserContext, middleware.AuthMiddleware, posts.PostEditMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/posts/{post_id}", utils.MiddlewareChain(posts.HandleDeletePost, middleware.UserContext, middleware.AuthMiddleware, posts.PostDeleteMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/posts", utils.MiddlewareChain(posts.HandleGetUserPosts, middleware.UserContext, middleware.AuthMiddleware, posts.UserPostsViewMiddleware))

	// Comments
	socialMux.HandleFunc("POST", "/api/v1/posts/{post_id}/comments", utils.MiddlewareChain(posts.HandleCreateComment, middleware.UserContext, middleware.AuthMiddleware, posts.CommentViewMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/posts/{post_id}/comments", utils.MiddlewareChain(posts.HandleGetComments, middleware.UserContext, middleware.AuthMiddleware, posts.CommentViewMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/comments/{comment_id}", utils.MiddlewareChain(posts.HandleDeleteComment, middleware.UserContext, middleware.AuthMiddleware, posts.CommentDeleteMiddleware))

	// Reactions
	socialMux.HandleFunc("POST", "/api/v1/posts/{post_id}/like", utils.MiddlewareChain(posts.HandleLikePost, middleware.UserContext, middleware.AuthMiddleware, posts.PostViewMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/posts/{post_id}/like", utils.MiddlewareChain(posts.HandleUnlikePost, middleware.UserContext, middleware.AuthMiddleware, posts.PostViewMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/comments/{comment_id}/like", utils.MiddlewareChain(posts.HandleLikeComment, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/comments/{comment_id}/like", utils.MiddlewareChain(posts.HandleUnlikeComment, middleware.UserContext, middleware.AuthMiddleware))

	// notifications
	socialMux.HandleFunc("GET", "/api/v1/notifications", utils.MiddlewareChain(notifications.HandleGetNotifications, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/notifications/unread-count", utils.MiddlewareChain(notifications.HandleGetUnreadCount, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/notifications/mark-all-read", utils.MiddlewareChain(notifications.HandleMarkAllNotifAsRead, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/notifications/{id}/mark-read", utils.MiddlewareChain(notifications.HandleMarkNotifAsRead, middleware.AuthMiddleware, notifications.NotifMiddleware))

	// search
	socialMux.HandleFunc("GET", "/api/v1/search", utils.MiddlewareChain(search.HandleSearch, middleware.UserContext, middleware.AuthMiddleware))

	// ws
	socialMux.HandleFunc("GET", "/ws", utils.MiddlewareChain(socket.UpgradeProtocol, middleware.AuthMiddleware))

	// Feed   ( personal && Specific user feed && Group feed )
	socialMux.HandleFunc("GET", "/api/v1/feed", utils.MiddlewareChain(feed.GetFeed, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/feed", utils.MiddlewareChain(feed.GetFeedUser, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}/feed", utils.MiddlewareChain(feed.GetFeedGroup, middleware.AuthMiddleware, feed.IsGroupMember))

	socialMux.HandleFunc("GET", "/api/v1/users/id", utils.MiddlewareChain(GetId, middleware.AuthMiddleware))

	return socialMux
}

func GetId(w http.ResponseWriter, r *http.Request) {
	viewerUserId := utils.GetUserIdFromContext(r)
	if viewerUserId == -1 {
		utils.BadRequest(w, "Invalid user ID.", "redirect")
		return
	}
	type Id struct {
		Id int64 `json:"Id"`
	}

	var id Id
	id.Id = viewerUserId

	// Return success response
	utils.WriteSuccess(w, http.StatusOK, id)
}
