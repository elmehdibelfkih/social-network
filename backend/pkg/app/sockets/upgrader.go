package socket

import (
	"net/http"
	"social/pkg/utils"

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

	// create the client sturuct
	c := NewClient(WSManger, conn, userId, sessionCookie)

	WSManger.add <- c

	go c.readMessages()
	go c.writeMessages()
}
