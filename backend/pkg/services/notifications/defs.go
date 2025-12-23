package notifications

const (
	MAX_NUM_OF_NOTIFICATIONS = 20
)

var validTypes = map[string]bool{
	"post_liked":     true,
	"post_commented": true,
	"group_invite":   true,
	"group_join":     true,
	"event_created":  true,
	"follow_request": true,
	"custom":         true,
}

type Notification struct {
	ID            int64   `json:"notificationId" db:"id"`
	UserID        int64   `json:"-" db:"user_id"`
	Type          string  `json:"type" db:"type"`
	ActorName     string  `json:"actorName"`
	ActorAvatarId *int64  `json:"actorAvatarId"`
	ReferenceType string  `json:"referenceType" db:"reference_type"`
	ReferenceID   *int64  `json:"referenceId" db:"reference_id"`
	Content       *string `json:"content" db:"content"`
	IsRead        int     `json:"isRead" db:"is_read"`
	CreatedAt     string  `json:"createdAt" db:"created_at"`
	ReadAt        *string `json:"readAt" db:"read_at"`
}

type NotificationsResponse struct {
	Limit         int             `json:"limit"`
	Notifications []*Notification `json:"notifications"`
}

type UnreadCountResponse struct {
	Count int `json:"unreadCount"`
}
