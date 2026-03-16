package websocket

import (
	"encoding/json"
	"log"
)

type Hub struct {
	rooms      map[int64]map[*Client]bool
	broadcast  chan *SavedMessage
	register   chan *Client
	unregister chan *Client
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[int64]map[*Client]bool),
		broadcast:  make(chan *SavedMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func getRoomsByID(id int64) []int64 {
	return testRooms[id]
}

var testRooms = map[int64][]int64{
	1: {1, 2},
	2: {2},
	3: {1},
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			// このクライアントがどのルームに所属しているかサーバーに聞く
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
				"Broadcasting message to room %d: %s",
				savedMessage.RoomID,
				savedMessage.Content,
			)

			data, err := json.Marshal(savedMessage)
			if err != nil {
				log.Println("json marshal error:", err)
				continue
			}

			if clients, ok := h.rooms[savedMessage.RoomID]; ok {
				for client := range clients {
					select {
					case client.send <- data:
						log.Printf(
							"Sent message to client: %v, Client %d",
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
