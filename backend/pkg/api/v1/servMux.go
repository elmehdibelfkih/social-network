package v1

import (
	"fmt"
	"log"
	"net/http"
	"social/pkg/app/dependencies/middleware"
)

func SocialMux() *http.ServeMux {
	socialMux := http.NewServeMux()
	socialMux.HandleFunc("/", middleware.UserContext(func(w http.ResponseWriter, r *http.Request) {
		log.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
		fmt.Fprintf(w, "hello")
	}))

	return socialMux
}
