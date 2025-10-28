package main

import migration "social/db/database"
import server "social/pkg/app/server"

func main() {
	migration.InitDB()
	server.StartServer()
}
