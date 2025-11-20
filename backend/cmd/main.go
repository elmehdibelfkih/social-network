package main

import (
	server "social/pkg/app/server"
	socket "social/pkg/app/sockets"
	migration "social/pkg/db/database"
	errorLogger "social/pkg/utils"
)

func main() {
	errorLogger.InitLogger()
	err := migration.InitDB()
	if err != nil {
		errorLogger.SQLiteErrorTarget(err, "migration")
		return
	}
	socket.InitWsHub()
	server.StartServer()
}
