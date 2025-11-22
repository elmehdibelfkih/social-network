package socket

import (
	"sync"
)

var WSManger *Hub

type Hub struct {
	clients map[int64][]*Client
	add     chan *Client
	remove  chan *Client

	mu sync.RWMutex
}

func InitWsHub() {
	WSManger = NewHub()
	go WSManger.Run()
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[int64][]*Client),
		add:     make(chan *Client, 32),
		remove:  make(chan *Client, 32),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.add:
			h.addClient(client)
		case client := <-h.remove:
			h.removeClient(client)
		}
	}
}

func (h *Hub) addClient(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[c.userId] = append(h.clients[c.userId], c)
	// log.Printf("WS connected: user %v", *c)
}

func (h *Hub) removeClient(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	clients, ok := h.clients[c.userId]
	if !ok {
		return
	}

	for i := range clients {
		if clients[i] == c {
			// close connection before deleting it
			clients[i].connection.Close()
			clients = append(clients[:i], clients[i+1:]...)
			break
		}
	}

	if len(clients) != 0 {
		h.clients[c.userId] = clients
		return
	}

	delete(h.clients, c.userId)
}
