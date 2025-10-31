package auth

import (
	"fmt"
	"net/http"
	"social/pkg/utils"
)

func PostRegister(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	var body RegisterRequestJson
	var err error
	err = utils.JsonStaticDecode(r, &body)
	if err != nil {
		utils.BackendErrorTarget(err, "register handler")
		utils.BadRequest(w, "request body invalid json format", "redirect")
	}

	err = GeneratePasswordHash(&body.Password)
	if err != nil {
		utils.BackendErrorTarget(err, "register handler")
		utils.InternalServerError(w)
	}

	response, err := InsertUserAccount(body)
	if err != nil {
		utils.InternalServerError(w)
	}

	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": false,
		"payload": response,
		"error":   map[string]any{},
	})

	// fmt.Fprintf(w, response)
}

func PostLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	fmt.Fprintf(w, "login")
}

func PostLogout(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
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
