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
	var body InviteUserRequestJson
	var response InviteUserResponseJson
	if !utils.ValidateJsonRequest(r, &body, "CreateGroup handler") {
		utils.BadRequest(w, "request body invalid json format", "redirect")
		return
	}
	if ok, str := body.Validate(); !ok {
		utils.BadRequest(w, str, "alert")
		return
	}
	if !InviteMember(w, r, &body, &response, "InviteMember handler") {
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

}

func PostEventRSVP(w http.ResponseWriter, r *http.Request) {

}

func GetGroupEvents(w http.ResponseWriter, r *http.Request) {

}

func GetEventInfo(w http.ResponseWriter, r *http.Request) {

}
