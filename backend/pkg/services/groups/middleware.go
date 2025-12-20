package groups

import (
	"net/http"
	"social/pkg/utils"
)

func IsGroupOwner(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		groupId := utils.GetWildCardValue(w, r, "group_id")
		check, err := SelectGroupOwner(groupId, userId)
		if err != nil {
			utils.BackendErrorTarget(err, "is group owner")
			utils.ForbiddenError(w, "you must be the owner of the group")
			return
		}
		if !check {
			utils.ForbiddenError(w, "you must be the owner of the group")
			return
		}
		next(w, r)
	}
}

func InvitationAvailable(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		targetId := utils.GetWildCardValue(w, r, "user_id")
		if userId == targetId {
			utils.BadRequest(w, "u cannot invite yourself", "alert")
			return
		}
		groupId := utils.GetWildCardValue(w, r, "group_id")
		check, err := SelectGroupMember(groupId, userId)
		if err != nil {
			utils.BackendErrorTarget(err, "is group member")
			utils.IdentifySqlError(w, err)
			return
		}
		if check {
			utils.BackendErrorTarget(err, "you cant invite a member of the group")
			utils.ForbiddenError(w, "you cant invite a member of the group")
			return
		}
		next(w, r)
	}
}

func IsNotMemeber(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		groupId := utils.GetWildCardValue(w, r, "group_id")
		check, err := SelectGroupMember(groupId, userId)
		if err != nil {
			utils.BackendErrorTarget(err, "is group member")
			utils.IdentifySqlError(w, err)
			return
		}
		if check {
			utils.BackendErrorTarget(err, "you are already a member")
			utils.ForbiddenError(w, "you are already a member")
			return
		}
		next(w, r)
	}
}

func IsMemeber(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		groupId := utils.GetWildCardValue(w, r, "group_id")
		check, err := SelectGroupMember(groupId, userId)
		if err != nil {
			utils.BackendErrorTarget(err, "is group member")
			utils.IdentifySqlError(w, err)
			return
		}
		if !check {
			utils.BackendErrorTarget(err, "you are not a member")
			utils.ForbiddenError(w, "you are not a member")
			return
		}
		next(w, r)
	}
}

func AcceptOrDecline(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		targetId := utils.GetWildCardValue(w, r, "user_id")
		groupId := utils.GetWildCardValue(w, r, "group_id")
		check, err := SelectGoupMemberPending(groupId, targetId)
		if err != nil {
			utils.BackendErrorTarget(err, "invitation is not pending")
			utils.IdentifySqlError(w, err)
			return
		}
		if !check {
			utils.BackendErrorTarget(err, "you are already a member")
			utils.ForbiddenError(w, "you are already a member")
			return
		}
		check, err = SelectGroupOwner(groupId, userId)
		if err != nil {
			utils.BackendErrorTarget(err, "invitation is not pending")
			utils.IdentifySqlError(w, err)
			return
		}
		if !check && (userId != targetId) {
			utils.BackendErrorTarget(err, "not targetd or owner")
			utils.ForbiddenError(w, "you must be the owner of the group")
			return
		}
		next(w, r)
	}
}
