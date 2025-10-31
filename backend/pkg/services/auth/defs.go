package auth

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

//api/v1/auth/login

type LoginRequestJson struct {
	Identifier string `json:"email/userId/nickname"` // flexible login field
	Password   string `json:"password"`
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

//api/v1/auth/logout

type LogoutResponseJson struct {
	Message string `json:"message"`
}

//api/v1/auth/session

type SessionResponseJson struct {
	SessionId    int64  `json:"sessionId"`
	SessionToken string `json:"sessionToken"`
	IpAddress    string `json:"ipAddress"`
	Device       string `json:"device"`
	CreatedAt    string `json:"createdAt"`
	// ExpiresAt    string `json:"expiresAt"`
}

//api/v1/sessions

type SessionsResponseJson struct {
	Sessions []SessionItemJson `json:"sessions"`
}

type SessionItemJson struct {
	SessionId int64  `json:"sessionId"`
	IpAddress string `json:"ipAddress"`
	Device    string `json:"device"`
	CreatedAt string `json:"createdAt"`
	Current   bool   `json:"current"`
	// ExpiresAt string `json:"expiresAt"`
}

//api/v1/sessions/:session_id

type RevokeSessionResponseJson struct {
	Message string `json:"message"`
}
