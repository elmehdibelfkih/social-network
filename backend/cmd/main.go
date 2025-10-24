package main

import (
	"fmt"
	"log"
	"social-network/backend/pkg/Server"
)

func main() {

	fmt.Println("Server started on http://localhost:8080")
	if err := Server.Myserver().ListenAndServe(); err != nil {
		log.Fatalf("500 - Internal Server Error: %v", err)
	}
	// start with the data base run and connect
	// passe the db to the midelware
	// check the handler
	// print on the logs on the bakend log file
	// when the server shutingdown or have any signal close the data base then the server
	// then run the server

}
