package utils

const (
	ErrorTypeAlert    = "alert"
	ErrorTypeRedirect = "redirect"
)

type APIError struct {
	StatusCode       int    `json:"statusCode"`
	StatusText       string `json:"statusText"`
	ErrorMessage     string `json:"errorMessage"`
	ErrorTitle       string `json:"errorTitle"`
	ErrorDescription string `json:"errorDescription"`
	ErrorType        string `json:"errorType"`
}

type APISuccessResponse struct {
	Success bool `json:"success"`
	Payload any  `json:"payload"`
}

type APIErrorResponse struct {
	Success bool     `json:"success"`
	Error   APIError `json:"error"`
}
