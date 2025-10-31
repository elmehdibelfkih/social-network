package media

import "time"

type Handler struct {
	manager MediaManager
}

// NediaManager defines the interface for media DB operations
type MediaManager interface {
	CreateMedia(media *Media) error
	GetMediaByID(id uint64) (*Media, error)
	DeleteMedia(id, userID uint64) (string, error) // returns the path so the can delete it from the memory
}

type Media struct {
	ID        uint64    `db:"id"`
	OwnerId   uint64    `db:"owner_id"`
	Path      string    `db:"path"`
	Mime      string    `db:"mime"`
	Size      uint64    `db:"size"`
	Purpose   string    `db:"purpose"`
	CreatedAt time.Time `db:"created_at"`
}

type UploadMediaRequest struct {
	Filename string `json:"fileName"`
	FileType string `json:"fileType"`
	FileData string `json:"fileData"`
	Purpose  string `json:"purpose"`
}

// for getting and uploading
type UploadMediaResponse struct {
	Message    string    `json:"message"`
	MediaID    uint64    `json:"mediaId"`
	MediaPath  string    `json:"mediaPath"`
	FileType   string    `json:"fileType"`
	UploadedAt time.Time `json:"uploadedAt"`
}

// for deleting
type DeleteMediaResponse struct {
	Message string `json:"message"`
	MediaID uint64 `json:"mediaId"`
}

const (
	MaxMediaSize = 10485760 // 10 MB
)
