package socket

import (
	"github.com/gorilla/websocket"
)

type ClientList map[*Client]bool

type Client struct {
	Connection *websocket.Conn
	UserId     int64
	SessionId  int64
}

func NewClient(conn *websocket.Conn, userId, sessionId int64) *Client {
	return &Client{
		Connection: conn,
		UserId:     userId,
		SessionId:  sessionId,
	}
}
