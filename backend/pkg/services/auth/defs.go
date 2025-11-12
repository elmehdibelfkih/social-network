package auth

import (
	"social/pkg/utils"
	"strconv"
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
	SessionId  int64
	Selector   string
	Token      string
	ExpiresAt  string
}

// validators

func (v *RegisterRequestJson) Validate() (bool, string) {
	if ok, str := utils.EmailValidation(v.Email); !ok {
		return false, str
	}
	if ok, str := utils.PasswordValidation(v.Password); !ok {
		return false, str
	}
	if ok, str := utils.FirstNameLastName(v.FirstName); !ok {
		return false, str
	}
	if ok, str := utils.FirstNameLastName(v.LastName); !ok {
		return false, str
	}
	if !utils.DateValidation(v.DateOfBirth) {
		return false, "invalid Date"
	}
	if v.Nickname != nil {
		if ok, str := utils.FirstNameLastName(*v.Nickname); !ok {
			return false, str
		}
	}
	if v.AboutMe != nil {
		if ok, str := utils.TextContentValidationEscape(v.AboutMe, 5, 2048); !ok {
			return false, str
		}
	}
	return true, "OK"
}

func (v *LoginRequestJson) Validate() (bool, string) {
	if v.Identifier == "" {
		return false, "Identifier cannot be empty"
	}
	if strings.Contains(v.Identifier, "@") {
		if ok, str := utils.EmailValidation(v.Identifier); !ok {
			return false, str
		}
	} else if _, err := strconv.ParseInt(v.Identifier, 10, 64); err != nil {
		if ok, str := utils.FirstNameLastName(v.Identifier); !ok {
			return false, str
		}
	}
	if ok, str := utils.PasswordValidation(v.Password); !ok {
		return false, str
	}
	return true, "OK"
}
