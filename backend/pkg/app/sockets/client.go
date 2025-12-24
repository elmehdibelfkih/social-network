package socket

import (
	"encoding/json"
	"social/pkg/utils"
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
	FirstName   string  `json:"firstName"`
	LastName    string  `json:"lastName"`
	Nickname    *string `json:"nickname"`
	AvatarId    *int64  `json:"avatarId"`
	AboutMe     *string `json:"aboutMe"`
	DateOfBirth string  `json:"dateOfBirth"`
	Privacy     string  `json:"privacy"`
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

func (c *Client) getClientChats() {
	if err := SelectUserChats(c); err != nil {
		utils.BackendErrorTarget(err, "getClientChats")
		return
	}
}

func (c *Client) updateSentMessages() {
	for chatId := range c.userChats {
		err := UpdateMessagesStatus(chatId, c.userId, "delivered")
		if err != nil {
			utils.BackendErrorTarget(err, "updating seen Message")
			return
		}
	}
}

func (c *Client) pongHandler(pongMsg string) error {
	return c.connection.SetReadDeadline(time.Now().Add(pongWait))
}

func (c *Client) readMessages() {
	defer func() {
		c.hub.removeClient(c)
		close(c.events)
	}()
	c.connection.SetReadLimit(512)
	if err := c.pongHandler(""); err != nil {
		utils.BackendErrorTarget(err, "pongHandler")
		return
	}
	c.connection.SetPongHandler(c.pongHandler)
	// read loop
	for {
		_, bytes, err := c.connection.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				utils.BackendErrorTarget(err, "error reading message")
			}
			break
		}
		var event Event
		if err := json.Unmarshal(bytes, &event); err != nil {
			utils.BackendErrorTarget(err, "invalid message format")
			continue
		}
		if err = c.handleEvent(event); err != nil {
			utils.BackendErrorTarget(err, "error Handling the event")
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
					utils.BackendErrorTarget(err, "connection closed")
				}
				return
			}
			if err = c.connection.WriteJSON(event); err != nil {
				utils.BackendErrorTarget(err, "cannot send the msg")
				return
			}
		case <-ticker.C:
			c.connection.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err = c.connection.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
				utils.BackendErrorTarget(err, "write msg")
				return
			}
		}
	}
}

func (c *Client) handleEvent(e Event) error {
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
			Type:    "default:" + e.Type,
			Payload: nil,
			Error:   nil,
		}
		return nil
	}
}
