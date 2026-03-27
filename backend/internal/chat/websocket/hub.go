package websocket

import (
	"encoding/json"
	"log"
)

type Hub struct {
	rooms      map[string]map[*Client]bool
	broadcast  chan *SavedMessage
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		broadcast:  make(chan *SavedMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func getRoomsByID(id string) []string {
	return testRooms[id]
}

var testRooms = map[string][]string{
	"11111111-1111-1111-1111-111111111111": {"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"},
	"22222222-2222-2222-2222-222222222222": {"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"},
	"33333333-3333-3333-3333-333333333333": {"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"},
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			// このクライアントがどのルームに所属しているかサーバーに聞く
			log.Printf(
				"client.id %s",
				client.id,
			)
			roomIDs := getRoomsByID(client.id)

			for _, roomID := range roomIDs {

				if h.rooms[roomID] == nil {
					h.rooms[roomID] = make(map[*Client]bool)
				}

				h.rooms[roomID][client] = true
			}

		case client := <-h.unregister:
			// このクライアントがどのルームに所属しているかサーバーに聞く
			roomIDs := getRoomsByID(client.id)
			for _, roomID := range roomIDs {
				if clients, ok := h.rooms[roomID]; ok {
					delete(clients, client)

					if len(clients) == 0 {
						delete(h.rooms, roomID)
					}
				}
			}
			close(client.send)

		case savedMessage := <-h.broadcast:
			log.Printf(
				"Broadcasting message to room %s: %s",
				savedMessage.RoomID,
				savedMessage.Content,
			)

			data, err := json.Marshal(savedMessage)
			if err != nil {
				log.Println("json marshal error:", err)
				continue
			}

			log.Println(h.rooms) 

			if clients, ok := h.rooms[savedMessage.RoomID]; ok {
				for client := range clients {
					select {
					case client.send <- data:
						log.Printf(
							"Sent message to client: %v, Client %s",
							client.conn.RemoteAddr(), client.id,
						)

					default:
						delete(clients, client)
						close(client.send)

						if len(clients) == 0 {
							delete(h.rooms, savedMessage.RoomID)
						}

						log.Printf(
							"Failed to send message, client removed: %v",
							client.conn.RemoteAddr(),
						)
					}
				}
			}
		}
	}
}
