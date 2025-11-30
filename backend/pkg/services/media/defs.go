package media

// NediaManager defines the interface for media DB operations
type Media struct {
	ID        int64  `db:"id"`
	OwnerId   *int64  `db:"owner_id"`
	Path      string `db:"path"`
	Mime      string `db:"mime"`
	Size      int    `db:"size"`
	Purpose   string `db:"purpose"`
	CreatedAt string `db:"created_at"`
}

type UploadMediaRequest struct {
	Filename string `json:"fileName"`
	FileType string `json:"fileType"`
	FileData string `json:"fileData"`
	Purpose  string `json:"purpose"`
}

// for getting and uploading
type UploadMediaResponse struct {
	Message    string `json:"message"`
	MediaID    int64  `json:"mediaId"`
	MediaPath  string `json:"mediaPath,omitempty"`
	FileType   string `json:"fileType"`
	UploadedAt string `json:"uploadedAt"`
}

// for deleting
type DeleteMediaResponse struct {
	Message string `json:"message"`
	MediaID int64  `json:"mediaId"`
}

const (
	MaxMediaSize   = 10485760 // 10 MB
	MaxRequestSize = MaxMediaSize + 1048576
)

var AllowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
}

var MediaPurposes = map[string]bool{
	"avatar":  true,
	"comment": true,
	"post":    true,
	"message": true,
}
