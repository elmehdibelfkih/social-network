package v1

import (
	"fmt"
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/app/dependencies/router"
	"social/pkg/services/auth"
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
	socialMux.HandleFunc("POST", "/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, middleware.UserContext, middleware.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, middleware.UserContext, middleware.AuthMiddleware))

	//Users_Profiles
	// GET profile - public endpoint (no auth required, but UserContext for optional user info)
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/profile", utils.MiddlewareChain(users.GetProfile, middleware.UserContext))
	// PUT profile - requires authentication
	socialMux.HandleFunc("PUT", "/api/v1/users/{user_id}/profile", utils.MiddlewareChain(users.PutProfile, middleware.UserContext, middleware.AuthMiddleware))
	// PATCH privacy - requires authentication
	socialMux.HandleFunc("PATCH", "/api/v1/users/{user_id}/privacy", utils.MiddlewareChain(users.PatchProfile, middleware.UserContext, middleware.AuthMiddleware))
	// GET stats - public endpoint
	socialMux.HandleFunc("GET", "/api/v1/users/{user_id}/stats", utils.MiddlewareChain(users.GetStats, middleware.UserContext))

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	// fmt.Println(r.Header)
	// fmt.Println(r.RemoteAddr)
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
