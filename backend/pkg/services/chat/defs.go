package chat

type lastMessage struct {
	Id int64  `json:"id"`
	Text string `json:"text"`
	CreatedAt string `json:"createdAt"`
}

type ConversationsList struct {
	ChatId int64   `json:"chatId"`
	GroupId *int64 `json:"groupId"`
	Name  string   `json:"name"`
	LastMessage lastMessage `json:"lastMessage"`
	UnreadCount int      `json:"unreadCount"`
	UpdatedAt   string   `json:"updatedAt"`
}
