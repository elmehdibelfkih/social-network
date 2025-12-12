package media

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"social/pkg/utils"
)

func HandleUploadMedia(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)
	var req UploadMediaRequest
	r.Body = http.MaxBytesReader(w, r.Body, MaxRequestSize)
	defer r.Body.Close()

	if ok := utils.ValidateJsonRequest(w, r, &req, "Media upload"); !ok {
		return
	}

	if !AllowedMimeTypes[req.FileType] {
		utils.UnsupportedMediaType(w)
		return
	}

	if !MediaPurposes[req.Purpose] {
		utils.BadRequest(w, "Invalid purpose for the media", utils.ErrorTypeAlert)
		return
	}

	data, err := base64.StdEncoding.DecodeString(req.FileData)
	if err != nil {
		utils.BadRequest(w, "The provided file data is not valid base64.", utils.ErrorTypeAlert)
		return
	}

	if len(data) > MaxMediaSize {
		utils.MediaTooLargeError(w, fmt.Sprintf("File size cannot exceed %d MB.", MaxMediaSize/1024/1024))
		return
	}

	detectedMediaType := http.DetectContentType(data)
	if !AllowedMimeTypes[detectedMediaType] {
		utils.UnsupportedMediaType(w)
		return
	}

	mediaID := utils.GenerateID()
	extensions, _ := mime.ExtensionsByType(detectedMediaType)
	if len(extensions) == 0 {
		utils.UnsupportedMediaType(w)
		return
	}

	storagDir := getStoragePathForPurpose(req.Purpose)
	mediaName := fmt.Sprintf("%d%s", mediaID, extensions[0])
	filePath := filepath.Join(storagDir, mediaName)

	if err := os.WriteFile(filePath, data, 0o644); err != nil {
		utils.BackendErrorTarget(err, "handleUploadMedia (WriteFile)")
		utils.InternalServerError(w)
		return
	}

	var ownerId *int64
	if req.Purpose == "avatar" {
		ownerId = nil
	} else {
		ownerId = &userId
	}

	media := &Media{
		ID:        mediaID,
		Path:      filePath,
		OwnerId:   ownerId,
		Mime:      detectedMediaType,
		Size:      len(data),
		Purpose:   req.Purpose,
		CreatedAt: time.Now().String(),
	}

	if err := CreateMedia(media); err != nil {
		os.Remove(filePath)
		utils.SQLiteErrorTarget(err, "handleUploadMedia (CreateMedia)")
		utils.InternalServerError(w)
		return
	}

	utils.WriteSuccess(w, http.StatusCreated, UploadMediaResponse{
		Message:    "Media uploaded successfully.",
		MediaID:    mediaID,
		FileType:   req.FileType,
		UploadedAt: media.CreatedAt,
	})
}

func HandleGetMedia(w http.ResponseWriter, r *http.Request) {
	mediaID := utils.GetWildCardValue(w, r, "media_id")

	media, err := GetMediaByID(mediaID)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "No media file found with the specified ID.")
			return
		}
		utils.SQLiteErrorTarget(err, "handleGetMedia (GetMediaByID)")
		utils.InternalServerError(w)
		return
	}

	fileData, err := os.ReadFile(media.Path)
	if err != nil {
		utils.BackendErrorTarget(err, "handleGetMedia (ReadFile)")
		utils.InternalServerError(w)
		return
	}

	encoded := base64.StdEncoding.EncodeToString(fileData)
	utils.WriteSuccess(w, http.StatusOK, map[string]string{
		"mediaEncoded": encoded,
	})
}

func HandleDeleteMedia(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserIdFromContext(r)

	mediaID, err := getMediaID(r)
	if err != nil {
		utils.BadRequest(w, "Invalid Parameter", utils.ErrorTypeAlert)
		return
	}

	_, err = DeleteMedia(mediaID, userId)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.NotFoundError(w, "No media file found with the specified ID.")
			return
		}
		if strings.Contains(err.Error(), "forbidden") {
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
