package socket

type Event struct {
	Source  string         `json:"source"`
	Type    string         `json:"type"`
	Payload *ClientMessage `json:"payload"`
}

type ClientMessage struct {
	// SourceId        int64            `json:"sourceId"`
	TypingIndicator *TypingIndicator `json:"typingIndicator"`
	ChatMessage     *ChatMessage     `json:"chatMessage"`
	MarkSeen        *MarkSeen        `json:"markSeen"`
	Notification    *Notification    `json:"notification"`
	OnlineStatus    *OnlineStatus    `json:"onlineStatus"`
}

type TypingIndicator struct {
	FirstName string  `json:"firstName"`
	LastName  string  `json:"lastName"`
	Nickname  *string `json:"nickName"`
	ChatId    int64   `json:"chatId"`
}

type ChatMessage struct {
	Id        int64  `json:"id"`
	ChatId    int64  `json:"chatId"`
	SenderId  int64  `json:"SenderId"`
	Content   string `json:"content"`
	SeenState string `json:"seenState"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type MarkSeen struct {
	Id        int64  `json:"id"`
	ChatId    int64  `json:"chatId"`
	SenderId  int64  `json:"SenderId"`
	Content   string `json:"content"`
	SeenState string `json:"seenState"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type Notification struct {
	Id           int64  `json:"id"`
	UserId       int64  `json:"userId"`
	Type         string `json:"type"`
	RefrenceId   int64  `json:"refrenceId"`
	RefrenceType int64  `json:"refrenceType"`
	Content      string `json:"content"`
	IsRead       string `json:"isRead"`
	CreatedAt    string `json:"createdAt"`
	ReadAt       string `json:"ReadAt"`
}

type OnlineStatus struct {
	OnlineUsers []User
}

type User struct {
	UserId      int64   `json:"userId"`
	Nickname    *string `json:"nickname"`
	Email       string  `json:"email"`
	FirstName   string  `json:"firstName"`
	LastName    string  `json:"lastName"`
	DateOfBirth string  `json:"dateOfBirth"`
	AvatarId    *int64  `json:"avatarId"`
	AboutMe     *string `json:"aboutMe"`
	Privacy     string  `json:"privacy"`
	Online      bool    `json:"online"`
}
