package socket

import (
	"encoding/json"
	"log"
	"time"
	"fmt"
	"github.com/gorilla/websocket"
)

type Client struct {
	hub          *Hub
	connection   *websocket.Conn
	userId       int64
	sessionToken string
	events       chan Event
}

var (
	pongWait     = 10 * time.Second
	pingInterval = (pongWait * 9) / 10
)

func NewClient(wsHub *Hub, conn *websocket.Conn, id int64, token string) *Client {
	return &Client{
		hub:          wsHub,
		connection:   conn,
		userId:       id,
		sessionToken: token,
		events:       make(chan Event, 256),
	}
}

func (c *Client) pongHandler(pongMsg string) error {
	log.Println("pong")
	return c.connection.SetReadDeadline(time.Now().Add(pongWait))
}

func (c *Client) readMessages() {
	defer func() {
		c.hub.removeClient(c)
		close(c.events)
	}()
	c.connection.SetReadLimit(512)
	if err := c.pongHandler(""); err != nil {
		log.Println(err)
		return
	}
	c.connection.SetPongHandler(c.pongHandler)
	// read loop
	for {
		_, bytes, err := c.connection.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading message: %v", err)
			}
			break
		}
		var event Event
		if err := json.Unmarshal(bytes, &event); err != nil {
			log.Println("invalid message format:", err)
			continue
		}
		fmt.Println("received event:", event)

		c.events <- event
	}
}

func (c *Client) writeMessages() {
	ticker := time.NewTicker(pingInterval)
	defer func() {
		ticker.Stop()
		// c.hub.removeClient(c)
	}()

	for {
		select {
		case event, ok := <-c.events:
			c.connection.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				if err := c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Println("connection closed: ", err)
				}
				return
			}
			if err := c.connection.WriteJSON(event); err != nil {
				log.Println("cannot send the msg", err)
				return
			}
		case <-ticker.C:
			log.Println("ping")
			c.connection.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.connection.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				log.Println("write msg: ", err)
				return
			}
		}
	}
}
