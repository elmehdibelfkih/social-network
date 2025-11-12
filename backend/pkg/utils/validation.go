package utils

import (
	"html"
	"net/http"
	"regexp"
	"strings"
	"time"
)

var (
	emailRegex      = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	nameRegex       = regexp.MustCompile(`^[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$`)
	passwordLength  = regexp.MustCompile(`^.{8,16}$`)
	passwordUpper   = regexp.MustCompile(`[A-Z]`)
	passwordLower   = regexp.MustCompile(`[a-z]`)
	passwordDigit   = regexp.MustCompile(`[0-9]`)
	passwordSpecial = regexp.MustCompile(`[!@#$%^&*]`)
	passwordNoSpace = regexp.MustCompile(`^\S+$`)
)

func EmailValidation(mail string) (bool, string) {
	n := strings.TrimSpace(mail)
	if len(mail) < 10 || len(mail) > 256 {
		return false, ""
	}
	return emailRegex.MatchString(n), n
}

func PasswordValidation(password string) (bool, string) {
	if !passwordLength.MatchString(password) {
		return false, "Password must be between 8 and 16 characters."
	}
	if !passwordUpper.MatchString(password) {
		return false, "Password must contain at least one uppercase letter."
	}
	if !passwordLower.MatchString(password) {
		return false, "Password must contain at least one lowercase letter."
	}
	if !passwordDigit.MatchString(password) {
		return false, "Password must contain at least one digit."
	}
	if !passwordSpecial.MatchString(password) {
		return false, "Password must contain at least one special character (e.g., !@#$%^&*)."
	}
	if !passwordNoSpace.MatchString(password) {
		return false, "Password must not contain any whitespace."
	}
	return true, "Password is valid!"
}

func FirstNameLastName(name string) (bool, string) {
	n := strings.TrimSpace(name)
	return nameRegex.MatchString(n), n
}

// DateValidation validates date in "yyyy-mm-dd" format
func DateValidation(dateStr string) bool {
	_, err := time.Parse("2006-01-02", dateStr)
	return err == nil
}

func TextContentValidationEscape(content *string, minLen, maxLen int) (bool, string) {
	trimmed := strings.TrimSpace(*content)
	if trimmed == "" {
		return false, "Content cannot be empty"
	}
	if len(*content) < minLen || len(*content) > maxLen {
		return false, "wrong length"
	}
	escaped := html.EscapeString(trimmed)
	content = &escaped
	return true, escaped
}

func ValidateJsonRequest(w http.ResponseWriter, r *http.Request, body any, context string) bool {
	err := JsonStaticDecode(r, &body)
	if err != nil {
		println(err.Error())
		BackendErrorTarget(err, context)
		BadRequest(w, "request body invalid json format", "redirect")
		return false
	}
	return true
}
