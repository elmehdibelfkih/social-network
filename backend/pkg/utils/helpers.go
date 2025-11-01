package utils

import (
	"encoding/json"
	"net/http"
	config "social/pkg/config"
)

func GetUserIdFromContext(r *http.Request) int64 {
	var userId int64
	if r.Context().Value(config.USER_ID_KEY) != nil {
		userId = r.Context().Value(config.USER_ID_KEY).(int64)
	}
	return userId
}

// this function is used to recive a json with an undefined format
func JsonDynamicDecode(r *http.Request) (any, error) {
	var data any
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&data)
	if err != nil {
		return nil, err
	}
	return data, err
}

func JsonStaticDecode(r *http.Request, v any) error {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&v)
	if err != nil {
		return err
	}
	return nil
}

func JsonResponseEncode(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func WriteSuccess(w http.ResponseWriter, code int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(APISuccessResponse{
		Success: true,
		Payload: payload,
	})
}
