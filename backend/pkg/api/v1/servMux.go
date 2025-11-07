package v1

import (
	"fmt"
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/app/dependencies/router"
	"social/pkg/services/auth"
	"social/pkg/services/groups"
	"social/pkg/services/media"
	"social/pkg/utils"
)

func SocialMux() *router.Router {
	socialMux := router.NewRouter()
	socialMux.HandleFunc("GET", "/", utils.MiddlewareChain(testHandler, middleware.AuthMiddleware, middleware.UserContext))
	socialMux.HandleFunc("DELETE", "/", utils.MiddlewareChain(testHandler, middleware.UserContext))

	//auth
	socialMux.HandleFunc("POST", "/api/v1/auth/register", utils.MiddlewareChain(auth.PostRegister))
	socialMux.HandleFunc("POST", "/api/v1/auth/login", utils.MiddlewareChain(auth.PostLogin))
	socialMux.HandleFunc("POST", "/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, middleware.UserContext, middleware.AuthMiddleware))

	//users
	//followers
	//feed
	//posts
	//media

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
	socialMux.HandleFunc("POST", "/api/v1/groups/{group_id}/events", utils.MiddlewareChain(groups.PostCreateEvent, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/events/{event_id}/rsvp", utils.MiddlewareChain(groups.PostEventRSVP, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/groups/{group_id}/events", utils.MiddlewareChain(groups.GetGroupEvents, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/events/{event_id}", utils.MiddlewareChain(groups.GetEventInfo, middleware.AuthMiddleware))

	//chat
	// notifications
	//media
	socialMux.HandleFunc("POST", "/api/v1/media/upload", media.HandleUploadMedia)
	socialMux.HandleFunc("GET", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleGetMedia, media.MediaMiddleware, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/media/{media_id} ", utils.MiddlewareChain(media.HandleDeleteMedia, media.MediaMiddleware, middleware.AuthMiddleware))

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
