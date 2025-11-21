package socket

type Event struct {
	Type    string        `json:"type"`
	Payload ClientMessage `json:"payload"`
}

type ClientMessage struct {
	SourceId   int64  `json:"sourceId"`
	Content    string `json:"message"`
	ChatId     int64  `json:"chatId"`
	RecievedAt string `json:"recievedAt"`
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
	Id       int64 `json:"id"`
	ChatId   int64 `json:"chatId"`
	SenderId int64 `json:"SenderId"`
	// Content   string `json:"content"`
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
	Email       string  `json:"email"`
	FirstName   string  `json:"firstName"`
	LastName    string  `json:"lastName"`
	DateOfBirth string  `json:"dateOfBirth"`
	Nickname    *string `json:"nickname"`
	AboutMe     *string `json:"aboutMe"`
	AvatarId    *int64  `json:"avatarId"`
	Online      bool    `json:"online"`
}

