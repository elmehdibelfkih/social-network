package socket

import (
	"net/http"
	"social/pkg/utils"
	"time"

	"github.com/gorilla/websocket"
)

var (
	websocketUpgrader = websocket.Upgrader{
		CheckOrigin:     checkOrigin,
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	switch origin {
	case "http://localhost:3000":
		return true
	default:
		return false
	}
}

var (
	pongWait     = 10 * time.Second
	pingInterval = (pongWait * 9) / 10
)

func UpgradeProtocol(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)

	if r.Header.Get("Upgrade") != "websocket" {
		utils.BadRequest(w, "not a websocket upgrade request", "redirect")
		return
	}

	sessionCookie, err := utils.GetUserSession(w, r)
	if err != nil {
		utils.BackendErrorTarget(err, "no session")
		utils.Unauthorized(w, "session_token unavialable")
		return
	}

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		utils.BackendErrorTarget(err, "no session")
		utils.InternalServerError(w)
		return
	}

	// Replace old connection atomically
}
