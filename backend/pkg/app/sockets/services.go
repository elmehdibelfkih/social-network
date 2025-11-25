package socket

import (
	"errors"
	"time"

	"social/pkg/utils"
)

func (c *Client) typing(e Event) error {
	var err error
	var chatId = e.Payload.TypingIndicator.ChatId
	// var userIds map[int64]struct{}
	if e.Payload.TypingIndicator == nil {
		return errors.New("no typing indicator on the payload")
	}
	// userIds, err = SelectChatParticipants(e.Payload.TypingIndicator.ChatId)
	// if err != nil {
	// 	return err
	// }
	if _, exists := c.userChats[chatId]; !exists {
		return errors.New("your not a part of this chat")
	}
	c.BroadcastAllWithoutSelf(Event{
		Type: "chat_typing",
		Payload: &ClientMessage{
			TypingIndicator: &TypingIndicator{
				FirstName: "",
				LastName:  "",
				Nickname:  nil,
				ChatId:    e.Payload.ChatMessage.ChatId,
			},
		},
	}, c.hub.chatUsers[chatId])

	if c.typingTimer[chatId] != nil {
		c.typingTimer[chatId].Stop()
	}

	c.typingTimer[chatId] = time.AfterFunc(typingWait, func() {
		c.BroadcastAllWithoutSelf(Event{
			Type: "chat_afk",
			Payload: &ClientMessage{
				TypingIndicator: &TypingIndicator{
					FirstName: "",
					LastName:  "",
					Nickname:  nil,
					ChatId:    e.Payload.ChatMessage.ChatId,
				},
			},
		}, c.hub.chatUsers[chatId])
	})
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

	for i := range users.OnlineUsers {
		if _, exist := onlineIDs[users.OnlineUsers[i].UserId]; exist {
			users.OnlineUsers[i].Online = true
		}
	}

	e.Payload.OnlineStatus = users
	c.events <- e
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
			err = c.write(e)
			if err != nil {
				return err
			}
		}
	}
	return err
}
