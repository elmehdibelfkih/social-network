package auth

import (
	"fmt"
	"net/http"
	"social/pkg/utils"
)

func PostRegister(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Route hit:", r.URL.Path, r.Header.Get("User-Agent"))
	var body RegisterRequestJson
	var err error

	if !utils.ValidateJsonRequest(w, r, &body, "register handler") {
		return
	}

	err = GeneratePasswordHash(&body.Password)
	if err != nil {
		utils.BackendErrorTarget(err, "register handler")
		utils.InternalServerError(w)
	}

	response, err := InsertUserAccount(body)
	if err != nil {
		utils.BackendErrorTarget(err, "register handler")
		utils.InternalServerError(w)
	}

	var s = SessionResponseJson{
		SessionId:    int64(utils.GenerateID()),
		UserId:       response.UserId,
		SessionToken: GenerateSessionToken(32),
		IpAddress:    r.RemoteAddr,
		Device:       r.Header.Get("User-Agent"),
	}

	err = InsertUserSession(s)
	if err != nil {
		utils.BackendErrorTarget(err, "register handler")
		utils.InternalServerError(w)
	}

	http.SetCookie(w, &http.Cookie{
		Name:  "session_token",
		Value: GenerateSessionToken(32),
		// Expires:  time.Now().Add(time.Hour * 1),
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})

	//todo:maybe online broadcast

	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})

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
