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
	socialMux.HandleFunc("POST", "/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, middleware.UserContext, middleware.AuthMiddleware))

	//media
	socialMux.HandleFunc("POST", "/api/v1/media/upload", media.HandleUploadMedia)
	socialMux.HandleFunc("GET", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleGetMedia, media.MediaMiddleware, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleDeleteMedia, media.MediaMiddleware, middleware.AuthMiddleware))

	//follow
	socialMux.HandleFunc("POST", "/api/v1/users/{user_id}/follow", utils.MiddlewareChain(follow.FollowRequest, follow.FollowRequestMiddleWare, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/users/{user_id}/unfollow", utils.MiddlewareChain(follow.UnfollowRequest, follow.UnfollowRequestMiddleWare, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/followers", utils.MiddlewareChain(follow.FollowersList, follow.FollowersFolloweesListMiddleWare, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/following", utils.MiddlewareChain(follow.FolloweesList, follow.FollowersFolloweesListMiddleWare, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/follow-requests", utils.MiddlewareChain(follow.FollowRequestList, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/follow-requests/{user_id}/accept", utils.MiddlewareChain(follow.AcceptFollowRequest, follow.AcceptFollowRequestMiddleWare, middleware.AuthMiddleware))
	socialMux.HandleFunc("POST", "/api/v1/follow-requests/{user_id}/decline", utils.MiddlewareChain(follow.DeclineFollowRequest, follow.DeclineFollowRequestMiddleWare, middleware.AuthMiddleware))
	//todo: cancel follow request

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
