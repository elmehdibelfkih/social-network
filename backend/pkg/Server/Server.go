package server

import (
	//server "_/home/jait/Desktop/social-network/backend/pkg/Server"
	"database/sql"
	"log"
	"net/http"
)



func connectTodb() (*sql.DB ,error){
	conn, err := sql.Open("sqlit3", "./mydatabase")
	if err != nil {
		log.Fatal(err)
		return nil,err
	}
	return conn,nil

}


func Myserver (db *sql.DB) http.Server{
	mux := http.NewServeMux()
	fileServer := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fileServer))

	server := http.Server {
		Addr: "8082",
		Handler: http.DefaultServeMux,
		ReadTimeout: 100,
	}

	//Handlers 
	  //http.HandleFunc("/api/user", user.handler) 
	  
 return server
}

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}