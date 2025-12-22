package socket

type Event struct {
	Source  string         `json:"source"`
	Type    string         `json:"type"`
	Payload *ClientMessage `json:"payload"`
	Error   *EventError    `json:"error"`
}

type EventError struct {
	Content error
}

type ClientMessage struct {
	// SourceId        int64            `json:"sourceId"`
	TypingIndicator *TypingIndicator `json:"typingIndicator"`
	ChatMessage     *ChatMessage     `json:"chatMessage"`
	MarkSeen        *MarkSeen        `json:"markSeen"`
	Notification    *Notification    `json:"notification"`
	OnlineStatus    *OnlineStatus    `json:"onlineStatus"`
	OnlineUser      *OnlineUser      `json:"onlineUser"`
	OfflineUser     *OfflineUser     `json:"offlineUser"`
}

type TypingIndicator struct {
	FirstName string  `json:"firstName"`
	LastName  string  `json:"lastName"`
	Nickname  *string `json:"nickName"`
	ChatId    int64   `json:"chatId"`
}

type ChatMessage struct {
	MessageId int64  `json:"messageId"`
	ChatId    int64  `json:"chatId"`
	SenderId  int64  `json:"senderId"`
	Content   string `json:"content"`
	SeenState string `json:"seenState"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type MarkSeen struct {
	MessageId int64  `json:"messageId"`
	ChatId    int64  `json:"chatId"`
	SenderId  int64  `json:"senderId"`
	Content   string `json:"content"`
	SeenState string `json:"seenState"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type Notification struct {
	NotificationId int64   `json:"notificationId"`
	ActorName      string  `json:"actorName"`
	ActorAvatarId  int64   `json:"actorAvatarId"`
	UserId         int64   `json:"userId"`
	Type           string  `json:"type"`
	RefrenceId     int64   `json:"refrenceId"`
	RefrenceType   string  `json:"refrenceType"`
	Content        string  `json:"content"`
	Status         string  `json:"status"`
	IsRead         string  `json:"isRead"`
	CreatedAt      string  `json:"createdAt"`
	ReadAt         *string `json:"readAt"`
}

type OnlineStatus struct {
	OnlineUsers []User `json:"onlineUsers"`
}

type User struct {
	ChatId      int64   `json:"chatId"`
	UnreadCount int64   `json:"unreadCount"`
	Role        string  `json:"role"`
	LastReadAt  string  `json:"lastReadAt"`
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

type OnlineUser struct {
	User User `json:"user"`
}

type OfflineUser struct {
	User User `json:"user"`
}

func (o *OnlineStatus) removeDuplicate() {
	seen := make(map[int64]bool)
	unique := make([]User, 0, len(o.OnlineUsers))

	for _, user := range o.OnlineUsers {
		if !seen[user.UserId] {
			seen[user.UserId] = true
			unique = append(unique, user)
		}
	}

	o.OnlineUsers = unique
}
