package groups

import (
	"net/http"

	"social/pkg/db/database"
	"social/pkg/utils"
)

func CreateGroup(w http.ResponseWriter, r *http.Request,
	body *CreateGroupRequestJson, response *CreateGroupResponseJson, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	err := InsertNewGroup(body, response, userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}

	err = InsertGroupChatId(response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	err = InsertNewGroupOwner(response.ChatId, response.GroupId, response.CreatorId, "accepted", "owner")
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}

	return true
}

func CreateGroupHttp(w http.ResponseWriter,
	response CreateGroupResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func InviteMember(w http.ResponseWriter, r *http.Request,
	response *InviteUserResponseJson, context string,
) bool {
	sourceId := utils.GetUserIdFromContext(r)
	targetId := utils.GetWildCardValue(w, r, "user_id")
	groupId := utils.GetWildCardValue(w, r, "group_id")
	if !ValidRelationship(w, r, targetId, context) {
		utils.Unauthorized(w, "You must be following or followed by this user to invite them")
		return false
	}
	err := InsertNewGroupMember(sourceId, targetId, groupId, "pending", "member", "group_invite", response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	response.Message = "User invited to group successfully."
	return true
}

func InviteMemberHttp(w http.ResponseWriter,
	response InviteUserResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func JoinGroup(w http.ResponseWriter, r *http.Request,
	groupId, userId int64, response *JoinGroupResponseJson, context string,
) bool {
	var placeHolder InviteUserResponseJson
	err := InsertNewGroupMember(userId, userId, groupId, "pending", "member", "group_join", &placeHolder)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	response.GroupId = placeHolder.GroupId
	response.Status = placeHolder.Status
	response.Message = "Join request submitted."
	return true
}

func JoinGroupHttp(w http.ResponseWriter,
	response JoinGroupResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func MemberStatusAccepted(w http.ResponseWriter, r *http.Request,
	groupId, userId int64, status string, response *AcceptMemberResponseJson, context string,
) bool {
	group := &GetGroupResponseJson{}
	err := SelectGroupById(groupId, userId, group)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	err = UpdateMemberStatusAccepted(group.ChatId, groupId, userId, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}

	err = UpdateMetaData("group", response.GroupId, 1)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}

	return true
}

func MemberStatusDeclined(w http.ResponseWriter, r *http.Request,
	groupId, userId int64, status string, response *DeclineMemberResponseJson, context string,
) bool {
	err := UpdateMemberStatusDeclined(groupId, userId, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}

	err = UpdateMetaData("group", response.GroupId, 1)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}

	return true
}

func AcceptInviteHttp(w http.ResponseWriter,
	response AcceptMemberResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func DeclineInviteHttp(w http.ResponseWriter,
	response DeclineMemberResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func GroupUpdate(w http.ResponseWriter, r *http.Request,
	body *UpdateGroupRequestJson, response *UpdateGroupResponseJson, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	groupId := utils.GetWildCardValue(w, r, "group_id")
	err := UpdateGroup(groupId, userId, body, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func GroupUpdateHttp(w http.ResponseWriter,
	response UpdateGroupResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func GroupInfo(w http.ResponseWriter, r *http.Request,
	response *GetGroupResponseJson, context string,
) bool {
	groupId := utils.GetWildCardValue(w, r, "group_id")
	userId := utils.GetUserIdFromContext(r)
	checkUserId := utils.GetQuerryPramInt(r, "checkUserId")
	if checkUserId != 0 {
		userId = checkUserId
	}

	err := SelectGroupById(groupId, userId, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func GetGroupInfoHttp(w http.ResponseWriter,
	response GetGroupResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func GroupsInfo(w http.ResponseWriter, r *http.Request,
	response *BrowseGroupsResponseJson, context string,
) bool {
	limit := utils.GetQuerryPramInt(r, "limit")
	lastItemId := utils.GetQuerryPramInt(r, "lastItemId")

	err := SelectGroupsById(limit, lastItemId, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func GroupsInfoByuser(w http.ResponseWriter, r *http.Request,
	response *BrowseGroupsResponseJson, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	limit := utils.GetQuerryPramInt(r, "limit")
	offset := utils.GetQuerryPramInt(r, "offset")
	err := SelectGroupsByUserId(limit, userId, offset, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func OtherGroupsInfoByuser(w http.ResponseWriter, r *http.Request,
	response *BrowseGroupsResponseJson, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	limit := utils.GetQuerryPramInt(r, "limit")
	offset := utils.GetQuerryPramInt(r, "offset")
	err := SelectOtherGroupsByUserId(limit, userId, offset, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func GetGroupsInfoHttp(w http.ResponseWriter,
	response BrowseGroupsResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func GroupMembers(w http.ResponseWriter, r *http.Request,
	response *ListGroupMembersResponseJson, context string,
) bool {
	groupId := utils.GetWildCardValue(w, r, "group_id")
	limit := utils.GetQuerryPramInt(r, "limit")
	lastItemId := utils.GetQuerryPramInt(r, "lastItemId")
	err := SelectGroupMembers(groupId, limit, lastItemId, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func GetGroupMembersHttp(w http.ResponseWriter,
	response ListGroupMembersResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func DeleteGroupService(w http.ResponseWriter, r *http.Request,
	response *DeleteGroupResponseJson, context string,
) bool {
	groupId := utils.GetWildCardValue(w, r, "group_id")
	userId := utils.GetUserIdFromContext(r)
	err := DeleteGroupFromGroups(groupId, userId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func DeleteGroupHttp(w http.ResponseWriter,
	response DeleteGroupResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

// events

func CreateEvent(w http.ResponseWriter, r *http.Request,
	body *CreateEventRequestJson, response *CreateEventResponseJson, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	groupId := utils.GetWildCardValue(w, r, "group_id")
	err := insertNewGroupEvent(userId, groupId, body, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func PostCreateEventHttp(w http.ResponseWriter,
	response CreateEventResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func EventRSVP(w http.ResponseWriter, r *http.Request,
	body *RSVPRequestJson, response *RSVPResponseJson, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	eventId := utils.GetWildCardValue(w, r, "event_id")
	err := UpdateRsvp(eventId, userId, body, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func SelectEventRSVP(w http.ResponseWriter, r *http.Request, response *GetRSVPResponseJson, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	eventId := utils.GetWildCardValue(w, r, "event_id")
	err := SelectRsvp(eventId, userId, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func CountEventRSVPHttp(w http.ResponseWriter,
	response GetRSVPResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func PostEventRSVPHttp(w http.ResponseWriter,
	response RSVPResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func EventInfo(w http.ResponseWriter, r *http.Request,
	response *GetEventResponseJson, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	groupId := utils.GetWildCardValue(w, r, "group_id")
	eventId := utils.GetWildCardValue(w, r, "event_id")
	err := SelectGoupEvent(groupId, eventId, userId, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func GetEventInfoHttp(w http.ResponseWriter,
	response GetEventResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

func EventsInfo(w http.ResponseWriter, r *http.Request,
	response *ListEventsResponseJson, context string,
) bool {
	groupId := utils.GetWildCardValue(w, r, "group_id")
	err := SelectAllGoupEvent(groupId, response)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	return true
}

func GetEventsInfoHttp(w http.ResponseWriter,
	response ListEventsResponseJson,
) {
	utils.JsonResponseEncode(w, http.StatusOK, map[string]any{
		"success": true,
		"payload": response,
		"error":   map[string]any{},
	})
}

// helpers

func ValidRelationship(w http.ResponseWriter, r *http.Request,
	targetId int64, context string,
) bool {
	userId := utils.GetUserIdFromContext(r)
	following, err := IsFollowing(userId, targetId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	followed, err := IsFollowed(userId, targetId)
	if err != nil {
		utils.BackendErrorTarget(err, context)
		utils.IdentifySqlError(w, err)
		return false
	}
	if !followed && !following {
		return false
	}

	return true
}

func IsFollowing(userId, follower int64) (bool, error) {
	check, err := SelectFollows(userId, follower)
	return check, err
}

func IsFollowed(userId, follower int64) (bool, error) {
	check, err := SelectFollows(follower, userId)
	return check, err
}

func addRemoveMemberUpdateCounterStruct(entityType string, entityID int64, counterName string, action string) database.DBCounterSetter {
	var counter database.DBCounterSetter

	counter.CounterName = counterName
	counter.EntityType = entityType
	counter.EntityID = entityID
	counter.Action = action

	return counter
}
