package v1

import (
	"fmt"
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/app/dependencies/router"
	"social/pkg/services/auth"
	follow "social/pkg/services/followers"
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
	socialMux.HandleFunc("POST", "/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, middleware.AuthMiddleware))

	//media
	socialMux.HandleFunc("POST", "/api/v1/media/upload", media.HandleUploadMedia)
	socialMux.HandleFunc("GET", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleGetMedia, media.MediaMiddleware, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleDeleteMedia, media.MediaMiddleware, middleware.AuthMiddleware))

	//follow
	socialMux.HandleFunc("POST", "/api/v1/users/{user_id}/follow", utils.MiddlewareChain(follow.FollowRequest, middleware.AuthMiddleware, follow.FollowRequestMiddleWare))
	socialMux.HandleFunc("POST", "/api/v1/users/{user_id}/unfollow", utils.MiddlewareChain(follow.UnfollowRequest, middleware.AuthMiddleware, follow.UnfollowRequestMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/followers", utils.MiddlewareChain(follow.FollowersList, middleware.AuthMiddleware, follow.FollowersFolloweesListMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/following", utils.MiddlewareChain(follow.FolloweesList, middleware.AuthMiddleware, follow.FollowersFolloweesListMiddleWare))
	socialMux.HandleFunc("GET", "/api/v1/follow-requests", utils.MiddlewareChain(follow.FollowRequestList, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/follow-requests/{user_id}/accept", utils.MiddlewareChain(follow.AcceptFollowRequest, middleware.AuthMiddleware, follow.AcceptFollowRequestMiddleWare))
	socialMux.HandleFunc("POST", "/api/v1/follow-requests/{user_id}/decline", utils.MiddlewareChain(follow.DeclineFollowRequest, middleware.AuthMiddleware, follow.DeclineFollowRequestMiddleWare))
	//todo: cancel follow request

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
