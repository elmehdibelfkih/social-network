package socket

import (
	"time"

	"social/pkg/utils"
)

func (c *Client) typing() {
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
}

func (c *Client) onlineStatus() {
	var event Event
	event.Payload = &ClientMessage{}
	event.Source = "client"
	users, err := SelectUserFollowers(c.userId)
	if err != nil {
		utils.BackendErrorTarget(err, "onlineStatus")
		return
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

	event.Payload.OnlineStatus = users
	c.events <- event
}
