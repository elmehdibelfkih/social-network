package chat

type LastMessage struct {
	Id        int64  `json:"id"`
	Text      string `json:"text"`
	CreatedAt string `json:"createdAt"`
}

type ConversationsList struct {
	ChatId      int64        `json:"chatId"`
	GroupId     *int64       `json:"groupId"`
	Name        string       `json:"name"`
	LastMessage *LastMessage `json:"lastMessage"`
	UnreadCount int          `json:"unreadCount"`
	UpdatedAt   string       `json:"updatedAt"`
}

type Message struct {
	MessageID int64  `json:"messageId"`
	SenderID  int64  `json:"senderId"`
	Text      string `json:"text"`
	CreatedAt string `json:"createdAt"`
}

type SendMessageRequest struct {
	Text string `json:"text"`
}

type ChatParticipant struct {
	UserID            int64  `json:"userId"`
	Username          string `json:"username"`
	Role              string `json:"role"`
	LastSeenMessageID int64  `json:"lastSeenMessageId"`
	UnreadCount       int    `json:"unreadCount"`
}

type SendMessageResponse struct {
	MessageID int64  `json:"messageId"`
	ChatID    int64  `json:"chatId"`
	SenderID  int64  `json:"senderId"`
	Text      string `json:"text"`
	CreatedAt string `json:"createdAt"`
}
