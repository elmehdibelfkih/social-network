package groups

import (
	"fmt"
	"net/http"
	"social/pkg/utils"
)

func GroupPricay(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.GetUserIdFromContext(r)
		groupId := utils.GetWildCardValue(w, r, "group_id")
		fmt.Println(userId, groupId)
	}
}
