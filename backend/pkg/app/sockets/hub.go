package socket

import (
	"sync"
)

type Hub struct {
	// Registered connections grouped by userId
	clients map[int64][]Client

	register   chan *Client
	unregister chan *Client
	broadcast  chan Message

	mu sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[int64][]Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan Message),
	}
}
