package media

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"social/pkg/config"
	"social/pkg/utils"
)

var AllowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) HandleUploadMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.MethodNotAllowed(w, "Only POST method is allowed for this endpoint.")
		return
	}

	userID, ok := r.Context().Value(config.USER_ID_KEY).(uint64)
	if !ok || userID == 0 {
		utils.Unauthorized(w, "You must be logged in to upload media.")
		return
	}

	var req UploadMediaRequest
	r.Body = http.MaxBytesReader(w, r.Body, MaxMediaSize)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.BadRequest(w, "The request body is not valid JSON.", err.Error())
		return
	}

	if !AllowedMimeTypes[req.FileType] {
		utils.UnsupportedMediaType(w)
		return
	}

	data, err := base64.StdEncoding.DecodeString(req.FileData)
	if err != nil {
		utils.BadRequest(w, "The provided file data is not valid base64.", err.Error())
		return
	}

	if len(data) > MaxMediaSize {
		utils.MediaTooLargeError(w, fmt.Sprintf("File size cannot exceed %d MB.", MaxMediaSize/1024/1024))
		return
	}

	mediaID := utils.GenerateID()
	extensions, _ := mime.ExtensionsByType(req.FileType)
	if len(extensions) == 0 {
		utils.UnsupportedMediaType(w)
		return
	}

	mediaName := fmt.Sprintf("%d%s", mediaID, extensions[0])
	filePath := filepath.Join("../data/uploads", mediaName)
	mediaPath := fmt.Sprintf("/media/%d", mediaID)

	if err := os.WriteFile(filePath, data, 0o644); err != nil {
		utils.BackendErrorTarget(err, "handleUploadMedia (WriteFile)")
		utils.InternalServerError(w)
		return
	}

	context := r.URL.Query().Get("context")
	purpose := getStoragePathForContext(context)

	media := &Media{
		ID:        mediaID,
		OwnerId:   userID,
		Path:      filePath,
		Mime:      req.FileType,
		Size:      uint64(len(data)),
		Purpose:   purpose,
		CreatedAt: time.Now(),
	}

	if err := h.manager.CreateMedia(media); err != nil {
		os.Remove(filePath)
		utils.SQLiteErrorTarget(err, "handleUploadMedia (CreateMedia)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusCreated, UploadMediaResponse{
		Message:    "Media uploaded successfully.",
		MediaID:    mediaID,
		MediaPath:  mediaPath,
		FileType:   req.FileType,
		UploadedAt: media.CreatedAt,
	})
}

func (h *Handler) HandleGetMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.MethodNotAllowed(w, "Only GET method is allowed for this endpoint.")
		return
	}

	mediaID, err := getMediaID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid Parameter", err.Error())
		return
	}

	media, err := h.manager.GetMediaByID(mediaID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "No media file found with the specified ID.")
			return
		}
		utils.SQLiteErrorTarget(err, "handleGetMedia (GetMediaByID)")
		utils.InternalServerError(w)
		return
	}

	w.Header().Set("Content-Type", media.Mime)
	http.ServeFile(w, r, media.Path)
}

func (h *Handler) HandleDeleteMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.MethodNotAllowed(w, "Only DELETE method is allowed for this endpoint.")
		return
	}

	userID, ok := r.Context().Value("userId").(uint64)
	if !ok || userID == 0 {
		utils.Unauthorized(w, "You must be logged in to delete media.")
		return
	}

	mediaID, err := getMediaID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid Parameter", err.Error())
		return
	}

	_, err = h.manager.DeleteMedia(mediaID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "No media file found with the specified ID.")
			return
		}
		if strings.Contains(err.Error(), "Forbidden") {
			utils.Unauthorized(w, "You do not have permission to delete this media.")
			return
		}
		utils.SQLiteErrorTarget(err, "handleDeleteMedia (DeleteMedia)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusOK, DeleteMediaResponse{
		Message: "Media deleted successfully.",
		MediaID: mediaID,
	})
}
