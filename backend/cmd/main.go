package main

import (
	migration "social/db/database"
	server "social/pkg/app/server"
	errorLogger "social/pkg/utils"
)

func main() {
	errorLogger.InitLogger()
	err := migration.InitDB()
	if err != nil {
		errorLogger.HandleSQLiteError(err, "migration")
		return
	}
	server.StartServer()
}
