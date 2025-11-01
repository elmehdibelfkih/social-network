package router

import (
	"net/http"
	"social/pkg/utils"
	"sort"
	"strings"
	"sync"
)

type Router struct {
	mu       sync.RWMutex
	patterns []*routeEntry
}

type routeEntry struct {
	patternSegments []string
	methods         map[string]http.Handler
	rawPattern      string
}

func NewRouter() *Router {
	return &Router{}
}

func (router *Router) Register(method, pattern string, h http.Handler) {
	method = strings.ToUpper(method)
	if !strings.HasPrefix(pattern, "/") {
		pattern = "/" + pattern
	}
	segs := splitPath(pattern)

	router.mu.Lock()
	defer router.mu.Unlock()

	for _, entry := range router.patterns {
		if entry.rawPattern == pattern {
			entry.methods[method] = h
			return
		}
	}

	entry := &routeEntry{
		patternSegments: segs,
		methods:         map[string]http.Handler{method: h},
		rawPattern:      pattern,
	}
	router.patterns = append(router.patterns, entry)
}

func (router *Router) HandleFunc(method, pattern string, fn func(http.ResponseWriter, *http.Request)) {
	router.Register(method, pattern, http.HandlerFunc(fn))
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	path := req.URL.Path
	reqSegs := splitPath(path)

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, entry := range r.patterns {
		if matchSegments(entry.patternSegments, reqSegs) {
			if h, ok := entry.methods[req.Method]; ok {
				h.ServeHTTP(w, req)
				return
			}
			allowed := allowedMethodsList(entry.methods)
			utils.MethodNotAllowed(w, "allowd methods in this endpoint: "+strings.Join(allowed, ", "))
			return
		}
	}

	http.NotFound(w, req)
}

func splitPath(p string) []string {
	p = strings.Trim(p, "/")
	if p == "" {
		return []string{}
	}
	return strings.Split(p, "/")
}

func matchSegments(pattern, req []string) bool {
	if len(pattern) != len(req) {
		return false
	}
	for i := 0; i < len(pattern); i++ {
		ps := pattern[i]
		if strings.HasPrefix(ps, ":") {
			continue
		}
		if ps != req[i] {
			return false
		}
	}
	return true
}

func allowedMethodsList(m map[string]http.Handler) []string {
	methods := make([]string, 0, len(m))
	for meth := range m {
		methods = append(methods, meth)
	}
	sort.Strings(methods)
	return methods
}
