package notifications

import "database/sql"

const (
	MAX_NUM_OF_NOTIFICATIONS = 20
)

var validTypes = map[string]bool{
	"post":    true,
	"comment": true,
	"group":   true,
	"event":   true,
	"user":    true,
	"chat":    true,
}

type Notification struct {
	ID            int64          `json:"notificationId" db:"id"`
	UserID        int64          `json:"-" db:"user_id"`
	Type          string         `json:"type" db:"type"`
	ReferenceType sql.NullString `json:"referenceType" db:"reference_type"`
	ReferenceID   sql.NullInt64  `json:"referenceId" db:"reference_id"`
	Content       sql.NullString `json:"content" db:"content"`
	IsRead        int            `json:"isRead" db:"is_read"`
	CreatedAt     string         `json:"createdAt" db:"created_at"`
	ReadAt        sql.NullString `json:"readAt" db:"read_at"`
}

type PaginatedNotificationsResponse struct {
	Page          int             `json:"page"`
	Limit         int             `json:"limit"`
	Notifications []*Notification `json:"notifications"`
}

type UnreadCountResponse struct {
	Count int `json:"unreadCount"`
}
