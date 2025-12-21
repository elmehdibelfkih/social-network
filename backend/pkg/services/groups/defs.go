package groups

import "social/pkg/utils"

//groups

// /api/v1/groups (POST) => create group
type CreateGroupRequestJson struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	AvatarId    *int64 `json:"avatarId"` // optional
}

type CreateGroupResponseJson struct {
	GroupId     int64  `json:"groupId"`
	CreatorId   int64  `json:"creatorId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	AvatarId    *int64 `json:"avatarId"` // optional
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

// /api/v1/groups/:group_id (GET) => get group info
type GetGroupResponseJson struct {
	GroupId     int64  `json:"groupId"`
	CreatorId   int64  `json:"creatorId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	MemberCount int64  `json:"memberCount"`
	AvatarId    *int64 `json:"avatarId"` // optional
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

// /api/v1/groups/:group_id (PUT) => update group
type UpdateGroupRequestJson struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	AvatarId    *int64 `json:"avatarId"` // optional
}

type UpdateGroupResponseJson struct {
	Message     string `json:"message"`
	GroupId     int64  `json:"groupId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	AvatarId    *int64 `json:"avatarId"` // optional
	UpdatedAt   string `json:"updatedAt"`
}

// /api/v1/groups/:group_id (DELETE) => delete group
type DeleteGroupResponseJson struct {
	Message string `json:"message"`
	GroupId int64  `json:"groupId"`
}

// /api/v1/groups (GET) => browse/search groups
type BrowseGroupsResponseJson struct {
	Limit       int64           `json:"limit"`
	TotalGroups int64           `json:"totalGroups"`
	Groups      []GroupItemJson `json:"groups"`
}

type GroupItemJson struct {
	GroupId     int64  `json:"groupId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	AvatarId    *int64 `json:"avatarId"` // optional
	CreatorId   int64  `json:"creatorId"`
	MemberCount int64  `json:"memberCount"`
	CreatedAt   string `json:"createdAt"`
}

type InviteUserResponseJson struct {
	Message       string `json:"message"`
	GroupId       int64  `json:"groupId"`
	InvitedUserId int64  `json:"invitedUserId"`
	Status        string `json:"status"`
	CreatedAt     string `json:"createdAt"`
}

// /api/v1/groups/:group_id/join (POST)
type JoinGroupResponseJson struct {
	Message string `json:"message"`
	GroupId int64  `json:"groupId"`
	Status  string `json:"status"`
}

// /api/v1/groups/:group_id/members/:user_id/accept (POST)
type AcceptMemberResponseJson struct {
	Message string `json:"message"`
	GroupId int64  `json:"groupId"`
	UserId  int64  `json:"userId"`
	Status  string `json:"status"`
	Role    string `json:"role"`
}

// /api/v1/groups/:group_id/members/:user_id/decline (POST)
type DeclineMemberResponseJson struct {
	Message string `json:"message"`
	GroupId int64  `json:"groupId"`
	UserId  int64  `json:"userId"`
	Status  string `json:"status"`
}

// /api/v1/groups/:group_id/members (GET)
type ListGroupMembersResponseJson struct {
	Limit   int64
	GroupId int64             `json:"group_id"`
	Members []GroupMemberJson `json:"members"`
}

type GroupMemberJson struct {
	UserId   int64  `json:"user_id"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
	JoinedAt string `json:"joined_at"`
}

type PaginationJson struct {
	Page  int64 `json:"page"`
	Limit int64 `json:"limit"`
	Total int64 `json:"total"`
}

//group_events

// /api/v1/groups/:group_id/events (POST)
type CreateEventRequestJson struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	StartAt     string `json:"startAt"`
	EndAt       string `json:"endAt"`
	Location    string `json:"location"`
}

type CreateEventResponseJson struct {
	EventId     int64  `json:"event_id"`
	GroupId     int64  `json:"group_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	StartAt     string `json:"startAt"`
	EndAt       string `json:"endAt"`
	Location    string `json:"location"`
	CreatedBy   int64  `json:"created_by"`
	CreatedAt   string `json:"created_at"`
}

// /api/v1/groups/:group_id/events (GET)
type ListEventsResponseJson struct {
	GroupId int64           `json:"group_id"`
	Events  []EventItemJson `json:"events"`
}

type EventItemJson struct {
	EventId     int64  `json:"event_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	StartAt     string `json:"startAt" db:"startAt"`
	EndAt       string `json:"endAt" db:"endAt"`
	Location    string `json:"location"`
	CreatedBy   int64  `json:"created_by"`
	CreatedAt   string `json:"created_at"`
}

// /api/v1/events/:event_id (GET)
type GetEventResponseJson struct {
	EventId     int64            `json:"event_id"`
	GroupId     int64            `json:"group_id"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	StartAt     string           `json:"startAt" db:"startAt"`
	EndAt       string           `json:"endAt" db:"endAt"`
	Location    string           `json:"location"`
	CreatedBy   EventCreatorJson `json:"created_by"`
	CreatedAt   string           `json:"created_at"`
}

type EventCreatorJson struct {
	UserId   int64  `json:"user_id"`
	Username string `json:"username"`
}

// /api/v1/events/:event_id/rsvp (POST)
type RSVPRequestJson struct {
	Option string `json:"option"`
}

type RSVPResponseJson struct {
	Message string `json:"message"`
}

type GetRSVPResponseJson struct{
	Countgoing *int32      `json:"going_count"`
	CountNotgoing *int32   `json:"notgoing_count"`
	Amigoing bool		  `json:"ami_going"`
}

// validators

func (v *CreateGroupRequestJson) Validate() (bool, string) {
	if ok, str := utils.TextContentValidationEscape(&v.Title, 5, 32); !ok {
		return false, str
	}
	if ok, str := utils.TextContentValidationEscape(&v.Description, 5, 4096); !ok {
		return false, str
	}
	return true, "OK"
}

func (v *UpdateGroupRequestJson) Validate() (bool, string) {
	if ok, str := utils.TextContentValidationEscape(&v.Title, 32, 5); !ok {
		return false, str
	}
	if ok, str := utils.TextContentValidationEscape(&v.Description, 4096, 5); !ok {
		return false, str
	}

	return true, "OK"
}

func (v *CreateEventRequestJson) Validate() (bool, string) {
	if ok, str := utils.TextContentValidationEscape(&v.Title, 5, 32); !ok {
		return false, str
	}
	if ok, str := utils.TextContentValidationEscape(&v.Description, 5, 4096); !ok {
		return false, str
	}
	if !utils.DateValidation(v.StartAt) {
		return false, "invalid Date"
	}
	if !utils.DateValidation(v.EndAt) {
		return false, "invalid Date"
	}
	if ok, str := utils.TextContentValidationEscape(&v.Location, 5, 32); !ok {
		return false, str
	}
	return true, "OK"
}

// FIXME

func (v *RSVPRequestJson) Validate() (bool, string) {
	// if !utils.OptionValidation(v.Option) {
	// 	return false, "invalid option"
	// }
	return true, "OK"
}
