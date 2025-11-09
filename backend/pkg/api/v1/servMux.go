package v1

import (
	"fmt"
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/app/dependencies/router"
	"social/pkg/services/auth"
	"social/pkg/services/chat"
	follow "social/pkg/services/followers"
	"social/pkg/services/groups"
	"social/pkg/services/media"
	"social/pkg/services/users"
	"social/pkg/utils"
)

func SocialMux() *router.Router {
	socialMux := router.NewRouter()
	socialMux.HandleFunc("GET", "/", utils.MiddlewareChain(testHandler, middleware.AuthMiddleware, middleware.UserContext))
	socialMux.HandleFunc("DELETE", "/", utils.MiddlewareChain(testHandler, middleware.UserContext))

	//auth
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
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}/events/{event_id}", utils.MiddlewareChain(groups.GetEventInfo, middleware.AuthMiddleware, groups.IsMemeber))
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}/events", utils.MiddlewareChain(groups.GetGroupEvents, middleware.AuthMiddleware, groups.IsMemeber))

	//chat
	socialMux.HandleFunc("GET", "/api/v1/chats", utils.MiddlewareChain(chat.GetUserChats, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/chats/{chat_id}/messages", utils.MiddlewareChain(chat.GetmassageByPagination, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/chats/{chat_id}/messages", utils.MiddlewareChain(chat.SendMessageHandler, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/chats/{chat_id}/messages/{msg_id}", utils.MiddlewareChain(chat.DeleteMessageHandler, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/chats/{chat_id}/participants", utils.MiddlewareChain(chat.GetParticipantsHandler, middleware.UserContext, middleware.AuthMiddleware))

	//media
	socialMux.HandleFunc("POST", "/api/v1/media/upload", media.HandleUploadMedia)
	socialMux.HandleFunc("GET", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleGetMedia, media.MediaMiddleware, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleDeleteMedia, media.MediaMiddleware, middleware.AuthMiddleware))

	//follow
	socialMux.HandleFunc("POST", "/api/v1/users/{user_id}/follow", utils.MiddlewareChain(follow.FollowHandler, middleware.AuthMiddleware, follow.FollowRequestMiddleWare))
	socialMux.HandleFunc("POST", "/api/v1/users/{user_id}/unfollow", utils.MiddlewareChain(follow.UnfollowHandler, middleware.AuthMiddleware, follow.UnfollowRequestMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/followers", utils.MiddlewareChain(follow.FollowersListHandler, middleware.AuthMiddleware, follow.FollowersFolloweesListMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/following", utils.MiddlewareChain(follow.FolloweesListHandler, middleware.AuthMiddleware, follow.FollowersFolloweesListMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/follow-requests", utils.MiddlewareChain(follow.FollowRequestListHandler, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/follow-requests/{user_id}/accept", utils.MiddlewareChain(follow.AcceptFollowHandler, middleware.AuthMiddleware, follow.AcceptFollowRequestMiddleWare))
	socialMux.HandleFunc("POST", "/api/v1/follow-requests/{user_id}/decline", utils.MiddlewareChain(follow.DeclineFollowHandler, middleware.AuthMiddleware, follow.DeclineFollowRequestMiddleWare))

	//Users_Profiles
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/profile", utils.MiddlewareChain(users.GetProfile, middleware.AuthMiddleware))
	socialMux.HandleFunc("PUT", "/api/v1/users/{user_id}/profile", utils.MiddlewareChain(users.PutProfile, middleware.AuthMiddleware))
	socialMux.HandleFunc("PATCH", "/api/v1/users/{user_id}/privacy", utils.MiddlewareChain(users.PatchProfile, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/stats", utils.MiddlewareChain(users.GetStats, middleware.AuthMiddleware))

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
