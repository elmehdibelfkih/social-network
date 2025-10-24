package server

import (
	//"database/sql"
	"fmt"
	"log"
	"net/http"
)

// func OpenDB() (*sql.DB, error) {
// 	conn, err := sql.Open("sqlit3", "./mydatabase")
// 	if err != nil {
// 		log.Fatal(err)
// 		return nil, err
// 	}
// 	return conn, nil

// }


// func CloseDB() error {
// 	if db != nil {
// 		if err := db.Close(); err != nil {
// 			return err
// 		}
// 		log.Println("Database connection closed")
// 	}
// 	return nil
// }



func Myserver() *http.Server {
	mux := http.NewServeMux()
	fileServer := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fileServer))
		
	//Handlers
		mux.HandleFunc("/", Hi)
		
	server := &http.Server{
		Addr:        ":8082",
		Handler:     logMiddleware(notFoundMiddleware(mux)),
	}

	return server
}

func Hi(wr http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(wr, "this is test")
}

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func notFoundMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowedPaths := map[string]bool{
			"/":                        true,
		}
		if !allowedPaths[r.URL.Path] {
			// notFoundHandler(w)
			return
		}
		next.ServeHTTP(w, r)
	})
}