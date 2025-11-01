package v1

import (
	"fmt"
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/app/dependencies/router"
	"social/pkg/services/auth"
	"social/pkg/utils"
)

func SocialMux() *router.Router {
	socialMux := router.NewRouter()
	socialMux.HandleFunc("POST", "/", utils.MiddlewareChain(testHandler, middleware.UserContext))
	socialMux.HandleFunc("DELETE", "/", utils.MiddlewareChain(testHandler, middleware.UserContext))
	socialMux.HandleFunc("POST", "/api/v1/auth/register", utils.MiddlewareChain(auth.PostRegister))
	socialMux.HandleFunc("POST", "/api/v1/auth/login", utils.MiddlewareChain(auth.PostLogin))
	socialMux.HandleFunc("POST", "/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, auth.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, auth.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, auth.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, auth.AuthMiddleware))
	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	// fmt.Println(r.Header)
	// fmt.Println(r.RemoteAddr)
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
