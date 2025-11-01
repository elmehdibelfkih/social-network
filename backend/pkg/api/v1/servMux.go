package v1

import (
	"fmt"
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/services/auth"
	"social/pkg/utils"
)

func SocialMux() *http.ServeMux {
	socialMux := http.NewServeMux()
	// utils.MiddlewareChain(testHandler, middleware.UserContext, middleware.UserContext, middleware.UserContext)
	socialMux.HandleFunc("/", utils.MiddlewareChain(testHandler, middleware.UserContext))

	//auth_service
	socialMux.HandleFunc("/api/v1/auth/register", utils.MiddlewareChain(auth.PostRegister))                               //POST
	socialMux.HandleFunc("/api/v1/auth/login", utils.MiddlewareChain(auth.PostLogin))                                     //POST
	socialMux.HandleFunc("/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, auth.AuthMiddleware))              //POST
	socialMux.HandleFunc("/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, auth.AuthMiddleware))             //GET
	socialMux.HandleFunc("/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, auth.AuthMiddleware))                // GET
	socialMux.HandleFunc("/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, auth.AuthMiddleware)) //DELETE

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	// fmt.Println(r.Header)
	// fmt.Println(r.RemoteAddr)
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
