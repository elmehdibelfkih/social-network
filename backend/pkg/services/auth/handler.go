package auth

import (
	"net/http"
	"social/pkg/utils"
)

func PostRegister(w http.ResponseWriter, r *http.Request) {
	var body RegisterRequestJson
	var response RegisterResponseJson
	var s SessionResponseJson
	if !utils.ValidateJsonRequest(r, &body, "register handler") {
		utils.BadRequest(w, "request body invalid json format", "redirect")
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	if !GeneratePasswordHash(w, &body, "register handler") {
		return
	}
	response, check := RegisterUserAccount(w, r, &body, &s, "register handler")
	if !check {
		return
	}
	RegisterUserHttp(w, response, s)
}

func PostLogin(w http.ResponseWriter, r *http.Request) {
	var body LoginRequestJson
	var response LoginResponseJson
	var s SessionResponseJson
	var remember RememberMeSqlRow
	if !utils.ValidateJsonRequest(r, &body, "login handler") {
		utils.BadRequest(w, "request body invalid json format", "redirect")
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	if !CheckPasswordHash(w, &body, &response, "login handler") {
		return
	}
	if !LoginUserAccount(w, r, &body, &response, &s, &remember, "login handler") {
		return
	}
	LoginUserHttp(w, response, s, remember)
}

func PostLogout(w http.ResponseWriter, r *http.Request) {
	var response LogoutResponseJson
	if !LogoutUserAccount(w, r, "logout handler") {
		return
	}
	LogoutUserHttp(w, response)
}

func GetSession(w http.ResponseWriter, r *http.Request) {
	var response SessionResponseJson
	if !GetUserSession(w, r, &response, "session handler") {
		return
	}
	GetUserSessionHttp(w, response)
}

func GetSessions(w http.ResponseWriter, r *http.Request) {
	var response SessionsResponseJson
	if !GetUserSessions(w, r, &response, "sessions handler") {
		return
	}
	GetUserSessionsHttp(w, response)
}

func DeleteSession(w http.ResponseWriter, r *http.Request) {
	var response RevokeSessionResponseJson
	sessionId := utils.GetWildCardValue(w, r, "session_id")
	if !DeleteSessionBySessionId(w, r, sessionId, "logout handler") {
		return
	}
	DeleteSessionHttp(w, response)
}
