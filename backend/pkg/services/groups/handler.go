package groups

import (
	"fmt"
	"net/http"
)

// groups
func GetGroupInfo(w http.ResponseWriter, r *http.Request) {
	var response GetGroupResponseJson
	fmt.Println(response)
}

func GetGroupsInfo(w http.ResponseWriter, r *http.Request) {

}

func GetGroupMembers(w http.ResponseWriter, r *http.Request) {

}

func PostCreateGroup(w http.ResponseWriter, r *http.Request) {

}

func PostInviteMember(w http.ResponseWriter, r *http.Request) {

}

func PostJoinGroup(w http.ResponseWriter, r *http.Request) {

}

func PostAcceptInvite(w http.ResponseWriter, r *http.Request) {

}

func PostDeclineInvite(w http.ResponseWriter, r *http.Request) {

}

func PutUpdateGroup(w http.ResponseWriter, r *http.Request) {

}

func DeleteGroup(w http.ResponseWriter, r *http.Request) {

}

// events

func GetGroupEvents(w http.ResponseWriter, r *http.Request) {

}

func GetEventInfo(w http.ResponseWriter, r *http.Request) {

}

func PostCreateEvent(w http.ResponseWriter, r *http.Request) {

}

func PostEventRSVP(w http.ResponseWriter, r *http.Request) {

}
