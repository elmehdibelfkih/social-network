package utils

import "net/http"

type Chain func(next http.HandlerFunc)http.HandlerFunc

func MiddlewareChain(f []func(next http.HandlerFunc)http.HandlerFunc)
