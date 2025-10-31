package middleware

import (
	"log"
	"net"
	"net/http"
	"sync"
	"time"
)

type TokenBucketLimiter struct {
	mu       sync.Mutex
	tokens   uint64
	fillRate float64
	capacity uint64
	lastTime time.Time
}

func RateLimiterMiddleware(next http.Handler, limit float64, burst uint64) http.Handler {
	ipLimiterMap := make(map[string]*TokenBucketLimiter)
	var mu sync.Mutex

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getIP(r)

		limiter, exists := ipLimiterMap[ip]
		mu.Lock()
		if !exists {
			limiter = newTokenBucketLimiter(limit, burst)
			ipLimiterMap[ip] = limiter
		}
		mu.Unlock()

		if !limiter.allow() {
			// w.Header().Set("Content-Type", "application/json") // todo
			// w.WriteHeader(http.StatusTooManyRequests)
			// http.ServeFile(w, r, "./templates/rate_limiting.html")
			http.Error(w, http.StatusText(http.StatusTooManyRequests), http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func getIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		log.Printf("Error parssing IP :%v", err)
		return ""
	}
	return host
}

func newTokenBucketLimiter(f float64, b uint64) *TokenBucketLimiter {
	return &TokenBucketLimiter{
		tokens:   b,
		fillRate: f,
		capacity: b,
		lastTime: time.Now(),
	}
}

func (t *TokenBucketLimiter) allow() bool {
	t.mu.Lock()
	defer t.mu.Unlock()

	now := time.Now()
	timePassed := now.Sub(t.lastTime).Seconds()
	tokensToAdd := timePassed * t.fillRate

	if tokensToAdd > 0 {
		t.tokens = min(t.capacity, t.tokens+uint64(tokensToAdd))
		t.lastTime = now
	}

	if t.tokens > 0 {
		t.tokens--
		return true
	}

	return false
}
