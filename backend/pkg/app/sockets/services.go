package socket

import (
	"time"

	"social/pkg/utils"
)

func (c *Client) typing(e Event) error{
	var err error
	typing := Event{
		Source: "client",
		Type:   "typing",
	}
	c.events <- typing

	if c.typingTimer != nil {
		c.typingTimer.Stop()
	}

	c.typingTimer = time.AfterFunc(typingWait, func() {
		afk := Event{
			Source: "client",
			Type:   "afk",
		}
		c.events <- afk
	})
	return  err
}

func (c *Client) onlineStatus(e Event) error{
	var err error
	e.Payload = &ClientMessage{}
	users, err := SelectUserFollowers(c.userId)
	if err != nil {
		utils.BackendErrorTarget(err, "websocket error")
		return err
	}

	c.hub.mu.Lock()
	onlineIDs := make(map[int64]struct{}, len(c.hub.clients))
	for id := range c.hub.clients {
		onlineIDs[id] = struct{}{}
	}
	c.hub.mu.Unlock()

	for i := range users.OnlineUsers {
		if _, exist := onlineIDs[users.OnlineUsers[i].UserId]; exist {
			users.OnlineUsers[i].Online = true
		}
	}

	e.Payload.OnlineStatus = users
	c.events <- e
	return err
}
