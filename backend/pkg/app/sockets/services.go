package socket

import (
	"errors"
	"time"

	"social/pkg/utils"
)

func (c *Client) ClientAdded(e Event) error {
	users, err := SelectUserFollowers(c.userId)

	if err != nil {
		utils.BackendErrorTarget(err, "websocket error")
		return err
	}
	e.Source = "server"
	e.Type = "onlineUser"
	e.Payload = &ClientMessage{
		OnlineUser: &OnlineUser{
			User: User{
				UserId:      c.userId,
				Email:       "",
				FirstName:   c.user.FirstName,
				LastName:    c.user.LastName,
				Nickname:    c.user.Nickname,
				DateOfBirth: c.user.DateOfBirth,
				AvatarId:    c.user.AvatarId,
				AboutMe:     c.user.AboutMe,
				Privacy:     c.user.Privacy,
				Online:      true,
			},
		},
	}
	if users != nil {
		for _, u := range users.OnlineUsers {
			for _, c := range c.hub.clients[u.UserId] { //todo:might be a problem
				c.events <- e
			}
		}
	}
	return err
}

func (c *Client) ClientRemoved(e Event) error {
	users, err := SelectUserFollowers(c.userId)
	if err != nil {
		utils.BackendErrorTarget(err, "websocket error")
		return err
	}
	e.Source = "server"
	e.Type = "offlineUser"
	e.Payload = &ClientMessage{
		OfflineUser: &OfflineUser{
			User: User{
				UserId:      c.userId,
				Email:       "",
				FirstName:   c.user.FirstName,
				LastName:    c.user.LastName,
				Nickname:    c.user.Nickname,
				DateOfBirth: c.user.DateOfBirth,
				AvatarId:    c.user.AvatarId,
				AboutMe:     c.user.AboutMe,
				Privacy:     c.user.Privacy,
				Online:      false,
			},
		},
	}
	if users != nil {
		for _, u := range users.OnlineUsers {
			for _, c := range c.hub.clients[u.UserId] { //todo:might be a problem
				c.events <- e
			}
		}
	}
	return err
}

func (c *Client) onlineStatus(e Event) error {
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
	if users != nil {
		for i := range users.OnlineUsers {
			if _, exist := onlineIDs[users.OnlineUsers[i].UserId]; exist {
				users.OnlineUsers[i].Online = true
			}
		}
	}
	e.Source = "server"
	e.Type = "online_status"
	e.Payload.OnlineStatus = users
	c.events <- e
	return err
}

func (c *Client) typing(e Event) error {
	var err error
	if e.Payload == nil {
		return errors.New("no payload")
	}
	if e.Payload.TypingIndicator == nil {
		return errors.New("no typing indicator on the payload")
	}
	var chatId = e.Payload.TypingIndicator.ChatId
	if _, exists := c.userChats[chatId]; !exists {
		return errors.New("your not a part of this chat")
	}
	c.BroadcastAllWithoutSelf(Event{
		Source: "server",
		Type:   "chat_typing",
		Payload: &ClientMessage{
			TypingIndicator: &TypingIndicator{
				FirstName: c.user.FirstName,
				LastName:  c.user.LastName,
				Nickname:  c.user.Nickname,
				ChatId:    e.Payload.ChatMessage.ChatId,
			},
		},
	}, c.hub.chatUsers[chatId])

	if c.typingTimer[chatId] != nil {
		c.typingTimer[chatId].Stop()
	}

	c.typingTimer[chatId] = time.AfterFunc(typingWait, func() {
		c.BroadcastAllWithoutSelf(Event{
			Source: "server",
			Type:   "chat_afk",
			Payload: &ClientMessage{
				TypingIndicator: &TypingIndicator{
					FirstName: c.user.FirstName,
					LastName:  c.user.LastName,
					Nickname:  c.user.Nickname,
					ChatId:    e.Payload.ChatMessage.ChatId,
				},
			},
		}, c.hub.chatUsers[chatId])
	})
	return err
}

func (c *Client) seen(e Event) error {
	var err error
	if e.Payload == nil {
		return errors.New("no payload")
	}
	if e.Payload.MarkSeen == nil {
		return errors.New("no seen mark on the payload")
	}
	var chatId = e.Payload.MarkSeen.ChatId
	if _, exists := c.userChats[chatId]; !exists {
		return errors.New("your not a part of this chat")
	}
	c.BroadcastAllWithoutSelf(Event{
		Source: "server",
		Type:   "chat_seen",
		Payload: &ClientMessage{
			MarkSeen: e.Payload.MarkSeen,
		},
	}, c.hub.chatUsers[chatId])
	return err
}

func (c *Client) message(e Event) error {
	var err error
	if e.Payload == nil {
		return errors.New("no payload")
	}
	if e.Payload.ChatMessage == nil {
		return errors.New("no seen mark on the payload")
	}
	var chatId = e.Payload.ChatMessage.ChatId
	if _, exists := c.userChats[chatId]; !exists {
		return errors.New("your not a part of this chat")
	}
	c.BroadcastAllWithoutSelf(Event{
		Source: "server",
		Type:   "chat_seen",
		Payload: &ClientMessage{
			ChatMessage: e.Payload.ChatMessage,
		},
	}, c.hub.chatUsers[chatId])
	return err
}

func (c *Client) notification(e Event) error {
	var err error
	if e.Payload == nil {
		return errors.New("no payload")
	}
	if e.Payload.Notification == nil {
		return errors.New("no seen mark on the payload")
	}
	var targetId = e.Payload.Notification.UserId
	c.BroadcastToSingleUser(Event{
		Source: "server",
		Type:   "notification",
		Payload: &ClientMessage{
			Notification: e.Payload.Notification,
		},
	}, c.hub.clients[targetId])
	return err
}

// helpers

func (c *Client) BroadcastAllWithoutSelf(e Event, clients map[int64][]*Client) error {
	var err error
	for userId, userConnections := range clients {
		if userId == c.userId {
			continue
		}
		for _, c := range userConnections {
			c.events <- e
		}
	}
	return err
}

func (c *Client) BroadcastToSingleUser(e Event, clients []*Client) error {
	var err error
	for _, c := range clients {
		c.events <- e
	}
	return err
}
