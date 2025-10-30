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

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
