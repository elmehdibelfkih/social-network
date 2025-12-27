package feed

import (
	"net/http"
	"social/pkg/utils"
)

// IsGroupMember middleware checks if user is an accepted member of the group
func IsGroupMember(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)

		if userId == -1 {
			utils.Unauthorized(w, "You must be logged in.")
			return
		}

		groupId := utils.GetWildCardValue(w, r, "group_id")
		if groupId <= 0 {
			utils.BadRequest(w, "Invalid group ID.", "redirect")
			return
		}

		isMember, err := checkGroupMember(groupId, userId)
		if err != nil {
			utils.BackendErrorTarget(err, "IsGroupMember middleware")
			utils.InternalServerError(w)
			return
		}

		if !isMember {
			utils.Unauthorized(w, "You must be a member of this group to view its feed.")
			return
		}

		next(w, r)
	}
}
