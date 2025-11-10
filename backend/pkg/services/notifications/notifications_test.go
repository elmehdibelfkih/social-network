package notifications

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"social/pkg/config"
	"social/pkg/utils"

	_ "github.com/mattn/go-sqlite3"
)

// setupTestDB creates an in-memory SQLite database for testing.
func setupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite3", ":memory:?_foreign_keys=on")
	if err != nil {
		t.Fatalf("Failed to open in-memory database: %v", err)
	}

	utils.InitLogger()

	// Create the necessary tables.
	// We need 'users' and 'notifications' tables for foreign keys to work.
	createUsersTable := `
	CREATE TABLE users (
		id INTEGER PRIMARY KEY,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		first_name TEXT NOT NULL,
		last_name TEXT NOT NULL,
		date_of_birth TEXT NOT NULL
	);`

	createNotificationsTable := `
	CREATE TABLE notifications (
		id INTEGER PRIMARY KEY,
		user_id INTEGER NOT NULL,
		type TEXT NOT NULL,
		reference_type TEXT,
		reference_id INTEGER,
		content TEXT,
		is_read INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
		read_at TEXT,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);`

	if _, err := db.Exec(createUsersTable); err != nil {
		t.Fatalf("Failed to create users table: %v", err)
	}
	if _, err := db.Exec(createNotificationsTable); err != nil {
		t.Fatalf("Failed to create notifications table: %v", err)
	}

	// Set the global DB config to this test database
	config.DB = db
	return db
}

func createTestUser(t *testing.T, id int64, email string) int64 {
	_, err := config.DB.Exec("INSERT INTO users (id, email, password_hash, first_name, last_name, date_of_birth) VALUES (?, ?, 'hash', 'Test', 'User', '2000-01-01')", id, email)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}
	return id
}

func insertTestNotification(t *testing.T, userID int64, nType, content string, isRead int) int64 {
	notifID := utils.GenerateID()
	_, err := config.DB.Exec(
		"INSERT INTO notifications (id, user_id, type, content, is_read) VALUES (?, ?, ?, ?, ?)",
		notifID, userID, nType, content, isRead,
	)
	if err != nil {
		t.Fatalf("Failed to insert test notification: %v", err)
	}
	return notifID
}

func TestStoreFunctions(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	userID1 := createTestUser(t, 1001, "user1@test.com")
	userID2 := createTestUser(t, 1002, "user2@test.com")

	t.Run("TestCreateNotification", func(t *testing.T) {
		err := CreateNotification(userID1, "post_liked", sql.NullString{}, sql.NullInt64{}, sql.NullString{String: "Someone liked your post", Valid: true})
		if err != nil {
			t.Fatalf("CreateNotification failed: %v", err)
		}

		// Verify it was created
		var count int
		err = config.DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND content = 'Someone liked your post'", userID1).Scan(&count)
		if err != nil {
			t.Fatalf("DB query failed: %v", err)
		}
		if count != 1 {
			t.Errorf("Expected 1 notification, got %d", count)
		}
	})

	t.Run("TestGetUnreadCount", func(t *testing.T) {
		// Clean slate
		config.DB.Exec("DELETE FROM notifications")
		insertTestNotification(t, userID1, "post_liked", "unread 1", 0)
		insertTestNotification(t, userID1, "post_liked", "unread 2", 0)
		insertTestNotification(t, userID1, "post_liked", "read 1", 1)

		count, err := GetUnreadCount(userID1)
		if err != nil {
			t.Fatalf("GetUnreadCount failed: %v", err)
		}
		if count != 2 {
			t.Errorf("Expected unread count of 2, got %d", count)
		}

		// Test user with 0 notifications
		count, err = GetUnreadCount(userID2)
		if err != nil {
			t.Fatalf("GetUnreadCount for user2 failed: %v", err)
		}
		if count != 0 {
			t.Errorf("Expected unread count of 0 for user2, got %d", count)
		}
	})

	t.Run("TestMarkNotificationRead", func(t *testing.T) {
		notifID := insertTestNotification(t, userID1, "post_liked", "to be read", 0)

		// Mark as read
		err := MarkNotificationRead(userID1, notifID)
		if err != nil {
			t.Fatalf("MarkNotificationRead failed: %v", err)
		}

		// Verify status
		var isRead int
		err = config.DB.QueryRow("SELECT is_read FROM notifications WHERE id = ?", notifID).Scan(&isRead)
		if err != nil {
			t.Fatalf("DB query failed: %v", err)
		}
		if isRead != 1 {
			t.Errorf("Expected is_read to be 1, got %d", isRead)
		}
	})

	t.Run("TestMarkNotificationRead_PermissionDenied", func(t *testing.T) {
		notifID := insertTestNotification(t, userID1, "post_liked", "user1's notif", 0)

		// User2 tries to mark User1's notification as read
		err := MarkNotificationRead(userID2, notifID)
		if err != sql.ErrNoRows {
			t.Errorf("Expected sql.ErrNoRows when user tries to mark another user's notification as read, got %v", err)
		}

		// Verify status is unchanged
		var isRead int
		err = config.DB.QueryRow("SELECT is_read FROM notifications WHERE id = ?", notifID).Scan(&isRead)
		if err != nil {
			t.Fatalf("DB query failed: %v", err)
		}
		if isRead != 0 {
			t.Errorf("Expected is_read to remain 0, got %d", isRead)
		}
	})

	t.Run("TestMarkAllNotificationsRead", func(t *testing.T) {
		config.DB.Exec("DELETE FROM notifications")
		insertTestNotification(t, userID1, "post_liked", "unread 1", 0)
		insertTestNotification(t, userID1, "post_liked", "unread 2", 0)
		insertTestNotification(t, userID1, "post_liked", "unread 3", 0)
		insertTestNotification(t, userID2, "post_liked", "user2 unread", 0) // Should not be affected

		err := MarkAllNotificationsRead(userID1)
		if err != nil {
			t.Fatalf("MarkAllNotificationsRead failed: %v", err)
		}

		// Verify count for user1
		var unreadCount1 int
		err = config.DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0", userID1).Scan(&unreadCount1)
		if err != nil {
			t.Fatalf("DB query failed: %v", err)
		}
		if unreadCount1 != 0 {
			t.Errorf("Expected 0 unread notifications for user1, got %d", unreadCount1)
		}

		// Verify count for user2
		var unreadCount2 int
		err = config.DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0", userID2).Scan(&unreadCount2)
		if err != nil {
			t.Fatalf("DB query failed: %v", err)
		}
		if unreadCount2 != 1 {
			t.Errorf("Expected 1 unread notification to remain for user2, got %d", unreadCount2)
		}
	})
}

// TestHandlerFunctions tests HTTP handlers in handler.go
func TestHandlerFunctions(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	userID1 := createTestUser(t, 1001, "user1@test.com")
	userID2 := createTestUser(t, 1002, "user2@test.com")

	t.Run("TestHandleGetNotifications", func(t *testing.T) {
		config.DB.Exec("DELETE FROM notifications")
		insertTestNotification(t, userID1, "post_liked", "notif 1", 0)
		insertTestNotification(t, userID1, "post_liked", "notif 2", 1)

		req := httptest.NewRequest(http.MethodGet, "/api/v1/notifications?page=1&limit=20&type=post_liked", nil)
		// Add user ID to context
		ctx := context.WithValue(req.Context(), config.USER_ID_KEY, userID1)
		req = req.WithContext(ctx)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(HandleGetNotifications)
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
		}

		// Define a struct to match the *actual* API response
		var apiResp struct {
			Success bool                           `json:"success"`
			Payload PaginatedNotificationsResponse `json:"payload"`
		}

		if err := json.NewDecoder(rr.Body).Decode(&apiResp); err != nil {
			t.Fatalf("Failed to decode JSON response: %v", err)
		}

		if !apiResp.Success {
			t.Errorf("Expected API success to be true")
		}

		// Now check the fields *inside* the payload
		if len(apiResp.Payload.Notifications) != 2 {
			t.Errorf("Expected 2 notifications, got %d", len(apiResp.Payload.Notifications))
		}
		if apiResp.Payload.Page != 1 {
			t.Errorf("Expected page 1, got %d", apiResp.Payload.Page)
		}
	})

	t.Run("TestHandleGetNotifications_InvalidParams", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/notifications?page=1&limit=100", nil) // Invalid limit
		ctx := context.WithValue(req.Context(), config.USER_ID_KEY, userID1)
		req = req.WithContext(ctx)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(HandleGetNotifications)
		handler.ServeHTTP(rr, req)

		// This tests the rigid validation logic in your handler
		if rr.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d for invalid limit, got %d", http.StatusBadRequest, rr.Code)
		}
	})

	t.Run("TestHandleMarkNotifAsRead", func(t *testing.T) {
		notifID := insertTestNotification(t, userID1, "post_liked", "mark me", 0)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/notifications/"+fmt.Sprintf("%d", notifID)+"/mark-read", nil)
		req.SetPathValue("id", fmt.Sprintf("%d", notifID)) // Set path value

		ctx := context.WithValue(req.Context(), config.USER_ID_KEY, userID1)
		req = req.WithContext(ctx)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(HandleMarkNotifAsRead)
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
			t.Log(rr.Body.String())
		}

		var apiResp struct {
			Success bool              `json:"success"`
			Payload map[string]string `json:"payload"` // Payload is the map
		}

		// 2. Decode into the wrapper struct
		if err := json.NewDecoder(rr.Body).Decode(&apiResp); err != nil {
			t.Fatalf("Failed to decode API response: %v", err)
		}

		if !apiResp.Success {
			t.Error("Expected API response success=true")
		}

		// 3. Check the message *inside* the payload
		if apiResp.Payload["message"] != "Notification marked as read." {
			t.Errorf("Unexpected response message: %s", apiResp.Payload["message"])
		}

		// Verify in DB
		var isRead int
		config.DB.QueryRow("SELECT is_read FROM notifications WHERE id = ?", notifID).Scan(&isRead)
		if isRead != 1 {
			t.Errorf("Expected notification to be marked as read in DB, got is_read = %d", isRead)
		}
	})

	t.Run("TestHandleMarkNotifAsRead_PermissionDenied", func(t *testing.T) {
		notifID := insertTestNotification(t, userID1, "user1's notif", "MarkNotifAsRead_PermissionDenied", 0)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/notifications/"+fmt.Sprintf("%d", notifID)+"/mark-read", nil)
		req.SetPathValue("id", fmt.Sprintf("%d", notifID))

		// Use UserID2 context
		ctx := context.WithValue(req.Context(), config.USER_ID_KEY, userID2)
		req = req.WithContext(ctx)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(HandleMarkNotifAsRead)
		handler.ServeHTTP(rr, req)

		// Your store logic returns sql.ErrNoRows, which your handler converts to NotFoundError
		if rr.Code != http.StatusNotFound {
			t.Errorf("Expected status %d for permission denied, got %d", http.StatusNotFound, rr.Code)
		}
	})

	t.Run("TestHandleMarkAllNotifAsRead", func(t *testing.T) {
		config.DB.Exec("DELETE FROM notifications")
		insertTestNotification(t, userID1, "post_liked", "unread 1", 0)
		insertTestNotification(t, userID1, "post_liked", "unread 2", 0)

		req := httptest.NewRequest(http.MethodPost, "/api/v1/notifications/mark-all-read", nil)
		ctx := context.WithValue(req.Context(), config.USER_ID_KEY, userID1)
		req = req.WithContext(ctx)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(HandleMarkAllNotifAsRead)
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
		}

		// Verify in DB
		var unreadCount int
		err := config.DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0", userID1).Scan(&unreadCount)
		if err != nil {
			t.Fatalf("DB query failed: %v", err)
		}
		if unreadCount != 0 {
			t.Errorf("Expected 0 unread notifications after marking all as read, got %d", unreadCount)
		}
	})

	t.Run("TestHandleGetUnreadCount", func(t *testing.T) {
		config.DB.Exec("DELETE FROM notifications")
		insertTestNotification(t, userID1, "post_liked", "unread 1", 0)
		insertTestNotification(t, userID1, "post_liked", "unread 2", 0)

		req := httptest.NewRequest(http.MethodGet, "/api/v1/notifications/unread-count", nil)
		ctx := context.WithValue(req.Context(), config.USER_ID_KEY, userID1)
		req = req.WithContext(ctx)

		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(HandleGetUnreadCount)
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
		}

		if rr.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
		}

		var apiResp struct {
			Success bool           `json:"success"`
			Payload map[string]int `json:"payload"`
		}

		if err := json.NewDecoder(rr.Body).Decode(&apiResp); err != nil {
			t.Fatalf("Failed to decode API response: %v", err)
		}

		if !apiResp.Success {
			t.Error("Expected API response success=true")
		}

		if apiResp.Payload["unreadCount"] != 2 {
			t.Errorf("Expected unreadCount of 2, got %d", apiResp.Payload["unreadCount"])
		}
	})
}
