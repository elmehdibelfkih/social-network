package utils

import (
	"encoding/json"
	"net/http"
)

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
