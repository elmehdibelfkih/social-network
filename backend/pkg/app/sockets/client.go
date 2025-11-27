package socket

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	hub          *Hub
	connection   *websocket.Conn
	user         UserData
	userId       int64
	sessionToken string
	typingTimer  map[int64]*time.Timer
	userChats    map[int64]struct{} // user chatrooms
	events       chan Event
}

type UserData struct {
	FirstName   string
	LastName    string
	Nickname    *string
	AvatarId    *int64
	AboutMe     *string
	DateOfBirth string
	Privacy     string
}

var (
	pongWait     = 10 * time.Second
	pingInterval = (pongWait * 9) / 10
	typingWait   = 3 * time.Second
)

func NewClient(wsHub *Hub, conn *websocket.Conn, id int64, token string, user UserData) *Client {
	return &Client{
		hub:          wsHub,
		connection:   conn,
		userId:       id,
		sessionToken: token,
		events:       make(chan Event, 256),
		typingTimer:  make(map[int64]*time.Timer),
		userChats:    make(map[int64]struct{}),
		user:         user,
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
				log.Println("error reading message:", err)
			}
			break
		}
		var event Event
		if err := json.Unmarshal(bytes, &event); err != nil {
			log.Println("invalid message format:", err)
			continue
		}
		fmt.Println("received event:", event)
		if err = c.handleEvent(event); err != nil {
			log.Println("error Handling the event:", err)
			return
		}
	}
}

func (c *Client) writeMessages() {
	var err error
	ticker := time.NewTicker(pingInterval)
	defer func() {
		c.hub.removeClient(c)
		ticker.Stop()
	}()
	//write loop
	for {
		select {
		case event, ok := <-c.events:
			c.connection.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				if err = c.connection.WriteMessage(websocket.CloseMessage, nil); err != nil {
					log.Println("connection closed: ", err)
				}
				return
			}
			if err = c.connection.WriteJSON(event); err != nil {
				log.Println("cannot send the msg", err)
				return
			}
		case <-ticker.C:
			log.Println("ping")
			c.connection.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err = c.connection.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				log.Println("write msg: ", err)
				return
			}
		}
	}
}

func (c *Client) handleEvent(e Event) error {
	fmt.Println(e.Type)
	switch e.Type {
	case "onlineUser":
		if err := c.ClientAdded(e); err != nil {
			c.events <- Event{
				Source:  "server",
				Type:    "error",
				Payload: nil,
				Error: &EventError{
					Content: err,
				},
			}
			return err
		}
		return nil
	case "offlineUser":
		if err := c.ClientRemoved(e); err != nil {
			c.events <- Event{
				Source:  "server",
				Type:    "error",
				Payload: nil,
				Error: &EventError{
					Content: err,
				},
			}
			return err
		}
		return nil
	case "online_status":
		if err := c.onlineStatus(e); err != nil {
			c.events <- Event{
				Source:  "server",
				Type:    "error",
				Payload: nil,
				Error: &EventError{
					Content: err,
				},
			}
			return err
		}
		return nil
	case "chat_typing":
		if err := c.typing(e); err != nil {
			c.events <- Event{
				Source:  "server",
				Type:    "error",
				Payload: nil,
				Error: &EventError{
					Content: err,
				},
			}
			return err
		}
		return nil
	case "chat_seen":
		if err := c.seen(e); err != nil {
			c.events <- Event{
				Source:  "server",
				Type:    "error",
				Payload: nil,
				Error: &EventError{
					Content: err,
				},
			}
			return err
		}
		return nil
	case "chat_message":
		if err := c.message(e); err != nil {
			c.events <- Event{
				Source:  "server",
				Type:    "error",
				Payload: nil,
				Error: &EventError{
					Content: err,
				},
			}
			return err
		}
		return nil
	case "notification":
		if err := c.notification(e); err != nil {
			c.events <- Event{
				Source:  "server",
				Type:    "error",
				Payload: nil,
				Error: &EventError{
					Content: err,
				},
			}
			return err
		}
		return nil
	default:
		c.events <- Event{
			Source:  "server",
			Type:    "error",
			Payload: nil,
			Error: &EventError{
				Content: fmt.Errorf("undefined event type"),
			},
		}
		return nil
	}
}
