package auth

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

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

func (h *Handler) handleUploadMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, http.StatusMethodNotAllowed, "Method Not Allowed", "POST", "Only POST method is allowed for this endpoint.")
		return
	}

	userID, ok := r.Context().Value("userId").(uint64)
	if !ok || userID == 0 {
		WriteError(w, http.StatusUnauthorized, "Unauthorized", "Authentication", "You must be logged in to upload media.")
		return
	}

	var req UploadMediaRequest
	r.Body = http.MaxBytesReader(w, r.Body, MaxMediaSize)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "Bad Request", "Invalid JSON", "The request body is not valid JSON.")
		return
	}

	if !AllowedMimeTypes[req.FileType] {
		WriteError(w, http.StatusUnsupportedMediaType, "Invalid File Type", "Upload Error", "Only JPEG, PNG, and GIF files are allowed.")
		return
	}

	data, err := base64.StdEncoding.DecodeString(req.FileData)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "Bad Request", "Invalid File Data", "The provided file data is not valid base64.")
		return
	}

	if len(data) > MaxMediaSize {
		WriteError(w, http.StatusRequestEntityTooLarge, "File Too Large", "Upload Error", fmt.Sprintf("File size cannot exceed %d MB.", MaxMediaSize/1024/1024))
		return
	}

	mediaID := utils.GenerateID()
	extensions, _ := mime.ExtensionsByType(req.FileType)
	if len(extensions) == 0 {
		WriteError(w, http.StatusUnsupportedMediaType, "Media Type Unsupported", "Upload Error", "The provided file type is unsupported.")
		return
	}

	mediaName := fmt.Sprintf("%d%s", mediaID, extensions[0])
	filePath := filepath.Join("../data/uploads", mediaName)
	mediaPath := fmt.Sprintf("/media/%d", mediaID)

	if err := os.WriteFile(filePath, data, 0o644); err != nil {
		utils.LogBackendError(err, "handleUploadMedia (WriteFile)")
		WriteError(w, http.StatusInternalServerError, "Internal Server Error", "File System Error", "Could not save uploaded file to disk.")
		return
	}

	media := &Media{
		ID:        mediaID,
		OwnerId:   userID,
		Path:      filePath,
		Mime:      req.FileType,
		Size:      uint64(len(data)),
		Purpose:   req.Purpose,
		CreatedAt: time.Now(),
	}

	if err := h.manager.CreateMedia(media); err != nil {
		os.Remove(filePath)
		utils.LogSQLiteError(err, "handleUploadMedia (CreateMedia)")
		WriteError(w, http.StatusInternalServerError, "Internal Server Error", "Database Error", "Could not save media metadata.")
		return
	}

	WriteSuccess(w, http.StatusCreated, UploadMediaResponse{
		Message:    "Media uploaded successfully.",
		MediaID:    mediaID,
		MediaPath:  mediaPath,
		FileType:   req.FileType,
		UploadedAt: media.CreatedAt,
	})
}

func (h *Handler) handleGetMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, http.StatusMethodNotAllowed, "Method Not Allowed", "GET", "Only GET method is allowed for this endpoint.")
		return
	}

	mediaID, err := getMediaID(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "Bad Request", "Invalid Parameter", err.Error())
		return
	}

	media, err := h.manager.GetMediaByID(mediaID)
	if err != nil {
		if err == sql.ErrNoRows {
			WriteError(w, http.StatusNotFound, "Not Found", "Not Found", "No media file found with the specified ID.")
			return
		}
		utils.LogSQLiteError(err, "handleGetMedia (GetMediaByID)")
		WriteError(w, http.StatusInternalServerError, "Internal Server Error", "Database Error", "Could not retrieve media file details.")
		return
	}

	w.Header().Set("Content-Type", media.Mime)
	http.ServeFile(w, r, media.Path)
}

func (h *Handler) handleDeleteMedia(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		WriteError(w, http.StatusMethodNotAllowed, "Method Not Allowed", "DELETE", "Only DELETE method is allowed for this endpoint.")
		return
	}

	userID, ok := r.Context().Value("userId").(uint64)
	if !ok || userID == 0 {
		WriteError(w, http.StatusUnauthorized, "Unauthorized", "Authentication", "You must be logged in to delete media.")
		return
	}

	mediaID, err := getMediaID(r)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "Bad Request", "Invalid Parameter", err.Error())
		return
	}

	_, err = h.manager.DeleteMedia(mediaID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			WriteError(w, http.StatusNotFound, "Not Found", "Not Found", "No media file found with the specified ID.")
			return
		}
		if strings.Contains(err.Error(), "Forbidden") {
			WriteError(w, http.StatusForbidden, "Forbidden", "Authorization", "You do not have permission to delete this media.")
			return
		}
		utils.LogSQLiteError(err, "handleDeleteMedia (DeleteMedia)")
		WriteError(w, http.StatusInternalServerError, "Internal Server Error", "Database Error", "Could not delete media file.")
		return
	}

	WriteSuccess(w, http.StatusOK, DeleteMediaResponse{
		Message: "Media deleted successfully.",
		MediaID: mediaID,
	})
}

func getMediaID(r *http.Request) (uint64, error) {
	query := r.URL.Query()
	mediaIDStr := query.Get("media_id")
	if mediaIDStr == "" {
		return 0, fmt.Errorf("The 'media_id' query parameter is required.")
	}

	id, err := strconv.ParseUint(mediaIDStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("The 'media_id' must be a valid integer.")
	}

	return id, nil
}

func WriteError(w http.ResponseWriter, code int, statusText, title, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(APIErrrorResponse{
		Success: false,
		Error: APIError{
			StatusCode:       code,
			StatusText:       statusText,
			ErrorMessage:     message,
			ErrorTitle:       title,
			ErrorDescription: message,
			ErrorType:        "alert",
		},
	})
}

func WriteSuccess(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(APISuccessResponse{
		Success: true,
		Payload: payload,
	})
}
