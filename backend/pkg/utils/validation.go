package utils

import (
	"regexp"
	"strings"
)

func EmailValidation(mail string) (bool,string) {
		

	n := strings.TrimSpace(mail)
	if (len(mail)<256&&len(mail)>10) {
		return false,""

	}
	
	mailregex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	return mailregex.MatchString(n),n
}

func PasswordValidation(password string) (bool, string) {
	minMaxLength := `.{8,16}`
	uppercaseLetter := `[A-Z]`
	lowercaseLetter := `[a-z]`
	digit := `[0-9]`
	specialChar := `[!@#$%^&*]`
	noWhitespace := `^\S+$`

	if !regexp.MustCompile(minMaxLength).MatchString(password) {
		return false, "Password must be between 8 and 16 characters."
	}

	if !regexp.MustCompile(uppercaseLetter).MatchString(password) {
		return false, "Password must contain at least one uppercase letter."
	}

	if !regexp.MustCompile(lowercaseLetter).MatchString(password) {
		return false, "Password must contain at least one lowercase letter."
	}

	if !regexp.MustCompile(digit).MatchString(password) {
		return false, "Password must contain at least one digit."
	}

	if !regexp.MustCompile(specialChar).MatchString(password) {
		return false, "Password must contain at least one special character (e.g., !@#$%^&*)."
	}

	if regexp.MustCompile(noWhitespace).MatchString(password) == false {
		return false, "Password must not contain any whitespace."
	}

	return true, "Password is valid!"
}

func FirstNameLastName(name string) (bool,string ) {
	n := strings.TrimSpace(name)
	nameRegex := regexp.MustCompile(`^[a-zA-Z]+(?:[-'\s][a-zA-Z]+)*$`)
	return nameRegex.MatchString(n),n
}

// for the date the validated format is "yyyy-mm-dd"
func DateValidation(dste string) bool {
	datePattern := regexp.MustCompile(`^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$`)
	return datePattern.MatchString(dste)
}
