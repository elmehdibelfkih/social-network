package auth

import (
	"fmt"
	"net/http"
	"social/pkg/utils"
)

func PostRegister(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))

	//request response
	var body RegisterRequestJson
	var response RegisterResponseJson
	//decoding r.body
	if !utils.ValidateJsonRequest(w, r, &body, "register handler") {
		return
	}
	// hashing password
	if !GeneratePasswordHash(w, &body, "register handler") {
		return
	}
	// db
	response, check := RegisterUserAccount(w, r, &body, "register handler")
	if !check {
		return
	}
	// set cookie and send response
	RegisterUserHttp(w, response)

}

func PostLogin(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	//request response
	var body LoginRequestJson
	var response LoginResponseJson
	//decoding r.body
	if !utils.ValidateJsonRequest(w, r, &body, "login handler") {
		return
	}
	//match the password hash
	if !CheckPasswordHash(w, &body, &response, "login handler") {
		return
	}
	//create user session
	if !LoginUserAccount(w, r, &body, &response, "login handler") {
		return
	}
	//set cookie and send response
	LoginUserHttp(w, response)
}

func PostLogout(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	var response LoginResponseJson

	if !LogoutUserAccount(w, r, &response, "logout handler") {
		return
	}

	fmt.Fprintf(w, "logout")
}

func GetSession(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "session")
}

func GetSessions(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "sessions []")
}

func DeleteSession(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "delete session")
}
