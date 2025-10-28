package server

import (
	"fmt"
	"log"
	"net/http"
	defs "social/pkg/app"
	middleware "social/pkg/app/dependencies/middleware"
	signals "social/pkg/app/dependencies/signals"
)

func StartServer() {
	server := &http.Server{
		Addr:    defs.PORT,
		Handler: middleware.RateLimiterMiddleware(nil, 60, 120),
	}

	fmt.Println(defs.SERVER_RUN_MESSAGE)

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			// db.CloseDB() // todo:
			log.Fatalf("server error: %v", err)
		}
	}()

	signals.HandleSignals(server)
}
