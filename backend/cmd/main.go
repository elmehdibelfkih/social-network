package main

import (
	server "backend/pkg/Server"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {

	// Create the server
	srv := server.Myserver()

	// Channel to receive OS signals (e.g., SIGINT, SIGTERM)
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	// Start the server in a goroutine
	go func() {
		fmt.Println("Server started on http://localhost:8082")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("500 - Internal Server Error: %v", err)
		}
	}()

	<-stop

	log.Println("Closing server...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Optional: Close database connection here, if you're using a database
	// if err := server.CloseDB(); err != nil {
	// 	log.Fatalf("Error closing the database: %v", err)
	// }

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server gracefully stopped")
}
