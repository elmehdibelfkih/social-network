package v1

import (
	"fmt"
	"net/http"
	"social/pkg/app/dependencies/middleware"
	"social/pkg/app/dependencies/router"
	"social/pkg/services/auth"
	"social/pkg/services/media"
	"social/pkg/utils"
)

func SocialMux() *router.Router {
	socialMux := router.NewRouter()
	socialMux.HandleFunc("GET", "/", utils.MiddlewareChain(testHandler, auth.AuthMiddleware, middleware.UserContext))
	socialMux.HandleFunc("DELETE", "/", utils.MiddlewareChain(testHandler, middleware.UserContext))

	//auth
	socialMux.HandleFunc("POST", "/api/v1/auth/register", utils.MiddlewareChain(auth.PostRegister))
	socialMux.HandleFunc("POST", "/api/v1/auth/login", utils.MiddlewareChain(auth.PostLogin))
	socialMux.HandleFunc("POST", "/api/v1/auth/logout", utils.MiddlewareChain(auth.PostLogout, middleware.UserContext, auth.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/auth/session", utils.MiddlewareChain(auth.GetSession, middleware.UserContext, auth.AuthMiddleware))
	socialMux.HandleFunc("GET", "/api/v1/sessions", utils.MiddlewareChain(auth.GetSessions, middleware.UserContext, auth.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/sessions/{session_id}", utils.MiddlewareChain(auth.DeleteSession, middleware.UserContext, auth.AuthMiddleware))

	// //medi
	// socialMux.HandleFunc("POST", "/api/v1/media/upload", utils.MiddlewareChain(media.HandleUploadMedia, media.MediaMiddleware, auth.AuthMiddleware))
	// socialMux.HandleFunc("GET", "/api/v1/media/{media_id}", media.HandleGetMedia)
	// socialMux.HandleFunc("GET", "/api/v1/media/{media_id}", utils.MiddlewareChain(media.HandleGetMedia, media.MediaMiddleware, auth.AuthMiddleware))
	socialMux.HandleFunc("DELETE", "/api/v1/media/{media_id} ", utils.MiddlewareChain(media.HandleDeleteMedia, media.MediaMiddleware, auth.AuthMiddleware))

	return socialMux
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	// fmt.Println(r.Header)
	// fmt.Println(r.RemoteAddr)
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "hello")
}
