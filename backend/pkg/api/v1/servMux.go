package v1

import (
	"fmt"
	"log"
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/utils"
)

func SocialMux() *http.ServeMux {
	socialMux := http.NewServeMux()
	// utils.MiddlewareChain(testHandler, middleware.UserContext, middleware.UserContext, middleware.UserContext)
	socialMux.HandleFunc("/", utils.MiddlewareChain(testHandler, middleware.UserContext))

	//auth_service
	socialMux.HandleFunc("/api/v1/auth/register", utils.MiddlewareChain(testHandler, nil))
	socialMux.HandleFunc("/api/v1/auth/login", utils.MiddlewareChain(testHandler, nil))
	socialMux.HandleFunc("/api/v1/auth/logout", utils.MiddlewareChain(testHandler, nil))
	socialMux.HandleFunc("/api/v1/auth/session", utils.MiddlewareChain(testHandler, nil))
	socialMux.HandleFunc("/api/v1/sessions", utils.MiddlewareChain(testHandler, nil))
	socialMux.HandleFunc("/api/v1/sessions/:session_id", utils.MiddlewareChain(testHandler, nil))

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
