package websocket

import (
	"log"
)

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client registered: %v", client.conn.RemoteAddr())

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client unregistered: %v", client.conn.RemoteAddr())
			}

		case message := <-h.broadcast:
			log.Printf("Broadcasting message: %s", message)
			for client := range h.clients {
				select {
				case client.send <- message:
					log.Printf("Sent message to client: %v", client.conn.RemoteAddr())
				default:
					close(client.send)
					delete(h.clients, client)
					log.Printf("Failed to send message, client removed: %v", client.conn.RemoteAddr())
				}
			}
		}
	}
}
