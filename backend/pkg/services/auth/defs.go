package auth

import (
	"social/pkg/utils"
	"strings"
)

// all optional fields revieve a pointer
// /api/v1/auth/register
type RegisterRequestJson struct {
	Email       string  `json:"email"`
	Password    string  `json:"password"`
	FirstName   string  `json:"firstName"`
	LastName    string  `json:"lastName"`
	DateOfBirth string  `json:"dateOfBirth"`
	Nickname    *string `json:"nickname"`
	AboutMe     *string `json:"aboutMe"`
	AvatarId    *int64  `json:"avatarId"`
}

type RegisterResponseJson struct {
	UserId      int64   `json:"userId"`
	Email       string  `json:"email"`
	FirstName   string  `json:"firstName"`
	LastName    string  `json:"lastName"`
	DateOfBirth string  `json:"dateOfBirth"`
	Nickname    *string `json:"nickname"`
	AboutMe     *string `json:"aboutMe"`
	AvatarId    *int64  `json:"avatarId"`
}

// api/v1/auth/login
type LoginRequestJson struct {
	Identifier string `json:"email/userId/nickname"` // flexible login field
	Password   string `json:"password"`
	RememberMe bool   `json:"rememberMe"`
}

type LoginResponseJson struct {
	UserId      int64   `json:"userId"`
	Email       string  `json:"email"`
	FirstName   string  `json:"firstName"`
	LastName    string  `json:"lastName"`
	DateOfBirth string  `json:"dateOfBirth"`
	Nickname    *string `json:"nickname"`
	AboutMe     *string `json:"aboutMe"`
	AvatarId    *int64  `json:"avatarId"`
}

// api/v1/auth/logout
type LogoutResponseJson struct {
	Message string `json:"message"`
}

// api/v1/auth/session
type SessionResponseJson struct {
	SessionId    int64  `json:"sessionId"`
	UserId       int64  `json:"userId"`
	SessionToken string `json:"sessionToken"`
	IpAddress    string `json:"ipAddress"`
	Device       string `json:"device"`
	CreatedAt    string `json:"createdAt"`
	ExpiresAt    string `json:"-"`
}

// api/v1/sessions
type SessionsResponseJson struct {
	Sessions []SessionItemJson `json:"sessions"`
}

type SessionItemJson struct {
	SessionId int64  `json:"sessionId"`
	UserId    int64  `json:"userId"`
	IpAddress string `json:"ipAddress"`
	Device    string `json:"device"`
	CreatedAt string `json:"createdAt"`
	Current   bool   `json:"current"`
	ExpiresAt string `json:"-"`
}

// api/v1/sessions/:session_id
type RevokeSessionResponseJson struct {
	Message string `json:"message"`
}

// helpers

type AvatarMediaSqlRow struct {
	MediaId   int64
	OwnerId   int64
	Path      string
	Mime      string
	Size      int64
	Purpose   string
	CreatedAt string
}

type RememberMeSqlRow struct {
	RememberId int64
	UserId     int64
	Selector   string
	Token      string
	ExpiresAt  string
}

// validators
func (v *RegisterRequestJson) Validate() (bool, string) {
	// Email
	if ok, email := utils.EmailValidation(v.Email); !ok {
		return false, "Invalid email address."
	} else {
		v.Email = email
	}

	// Password
	if ok, msg := utils.PasswordValidation(v.Password); !ok {
		return false, msg
	}

	// First name
	if ok, n := utils.FirstNameLastName(v.FirstName); !ok {
		return false, "Invalid first name format."
	} else {
		v.FirstName = n
	}

	// Last name
	if ok, n := utils.FirstNameLastName(v.LastName); !ok {
		return false, "Invalid last name format."
	} else {
		v.LastName = n
	}

	// Date of birth
	if !utils.DateValidation(v.DateOfBirth) {
		return false, "Invalid date of birth format. Expected yyyy-mm-dd."
	}

	// Optional fields
	if v.Nickname != nil {
		nick := strings.TrimSpace(*v.Nickname)
		if len(nick) < 3 || len(nick) > 32 {
			return false, "Nickname must be between 3 and 32 characters."
		}
		v.Nickname = &nick
	}

	if v.AboutMe != nil {
		about := strings.TrimSpace(*v.AboutMe)
		if len(about) > 512 {
			return false, "AboutMe cannot exceed 512 characters."
		}
		v.AboutMe = &about
	}

	// AvatarId is optional – no validation needed

	return true, "OK"
}
