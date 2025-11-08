package groups

import (
	"net/http"
	"social/pkg/utils"
)

// groups

func PostCreateGroup(w http.ResponseWriter, r *http.Request) {
	var body CreateGroupRequestJson
	var response CreateGroupResponseJson
	if !utils.ValidateJsonRequest(r, &body, "CreateGroup handler") {
		utils.BadRequest(w, "request body invalid json format", "redirect")
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	if !CreateGroup(w, r, &body, &response, "CreateGroup handler") {
		return
	}
	CreateGroupHttp(w, response)
}

func PostInviteMember(w http.ResponseWriter, r *http.Request) {
	var response InviteUserResponseJson
	if !InviteMember(w, r, &response, "InviteMember handler") {
		return
	}
	InviteMemberHttp(w, response)
}

func PostJoinGroup(w http.ResponseWriter, r *http.Request) {
	var response JoinGroupResponseJson
	userId := utils.GetUserIdFromContext(r)
	groupId := utils.GetWildCardValue(w, r, "group_id")
	if !JoinGroup(w, r, groupId, userId, &response, "JoinGroup handler") {
		return
	}
	JoinGroupHttp(w, response)
}

func PostAcceptInvite(w http.ResponseWriter, r *http.Request) {
	var response AcceptMemberResponseJson
	groupId := utils.GetWildCardValue(w, r, "group_id")
	userId := utils.GetWildCardValue(w, r, "user_id")
	if !MemberStatusAccepted(w, r, groupId, userId, "accepted", &response, "PostAcceptInvite handler") {
		return
	}
	response.Message = "User has been added to the group."
	AcceptInviteHttp(w, response)
}

func PostDeclineInvite(w http.ResponseWriter, r *http.Request) {
	var response DeclineMemberResponseJson
	groupId := utils.GetWildCardValue(w, r, "group_id")
	userId := utils.GetWildCardValue(w, r, "user_id")
	if !MemberStatusDeclined(w, r, groupId, userId, "declined", &response, "PostDeclineInvite handler") {
		return
	}
	response.Message = "Group join request declined."
	DeclineInviteHttp(w, response)
}

func PutUpdateGroup(w http.ResponseWriter, r *http.Request) {
	var body UpdateGroupRequestJson
	var response UpdateGroupResponseJson
	if !utils.ValidateJsonRequest(r, &body, "PutUpdateGroup handler") {
		utils.BadRequest(w, "request body invalid json format", "redirect")
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	if !GroupUpdate(w, r, &body, &response, "PutUpdateGroup handler") {
		return
	}
	GroupUpdateHttp(w, response)
}

func GetGroupInfo(w http.ResponseWriter, r *http.Request) {
	var response GetGroupResponseJson
	if !GroupInfo(w, r, &response, "GetGroupInfo handler") {
		return
	}
	GetGroupInfoHttp(w, response)
}

func GetGroupsInfo(w http.ResponseWriter, r *http.Request) {
	var response BrowseGroupsResponseJson
	if !GroupsInfo(w, r, &response, "GetGroupsInfo handler") {
		return
	}
	GetGroupsInfoHttp(w, response)
}

func GetGroupMembers(w http.ResponseWriter, r *http.Request) {
	var response ListGroupMembersResponseJson
	if !GroupMembers(w, r, &response, "GetGroupMembers handler") {
		return
	}
	GetGroupMembersHttp(w, response)
}

func DeleteGroup(w http.ResponseWriter, r *http.Request) {
	var response DeleteGroupResponseJson
	if !DeleteGroupService(w, r, &response, "GetGroupMembers handler") {
		return
	}
	DeleteGroupHttp(w, response)
}

// events

func PostCreateEvent(w http.ResponseWriter, r *http.Request) {
	var body CreateEventRequestJson
	var response CreateEventResponseJson
	if !utils.ValidateJsonRequest(r, &body, "PostCreateEvent handler") {
		utils.BadRequest(w, "request body invalid json format", "redirect")
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	if !CreateEvent(w, r, &body, &response, "PostCreateEvent handler") {
		return
	}
	PostCreateEventHttp(w, response)
}

func PostEventRSVP(w http.ResponseWriter, r *http.Request) {
	var body RSVPRequestJson
	var response RSVPResponseJson
	if !utils.ValidateJsonRequest(r, &body, "PostEventRSVP handler") {
		utils.BadRequest(w, "request body invalid json format", "redirect")
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	if !EventRSVP(w, r, &body, &response, "PostEventRSVP handler") {
		return
	}
	PostEventRSVPHttp(w, response)
}

func GetEventInfo(w http.ResponseWriter, r *http.Request) {
	var response GetEventResponseJson
	if !EventInfo(w, r, &response, "GetEventInfo handler") {
		return
	}
	GetEventInfoHttp(w, response)
}

func GetGroupEvents(w http.ResponseWriter, r *http.Request) {
	var response ListEventsResponseJson
	if !EventsInfo(w, r, &response, "GetEventInfo handler") {
		return
	}
	GetEventsInfoHttp(w, response)
}
