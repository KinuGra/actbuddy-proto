package websocket

import (
	"encoding/json"
	"log"

	"github.com/google/uuid"
)

type Hub struct {
	rooms      map[uuid.UUID]map[*Client]bool
	broadcast  chan *BroadcastMessage
	register   chan *Client
	unregister chan *Client
}

// BroadcastMessage は Hub 内でブロードキャストするメッセージ
type BroadcastMessage struct {
	RoomID  uuid.UUID
	Payload []byte
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[uuid.UUID]map[*Client]bool),
		broadcast:  make(chan *BroadcastMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			// クライアントが所属するルームすべてに登録
			for _, roomID := range client.roomIDs {
				if h.rooms[roomID] == nil {
					h.rooms[roomID] = make(map[*Client]bool)
				}
				h.rooms[roomID][client] = true
			}

		case client := <-h.unregister:
			for _, roomID := range client.roomIDs {
				if clients, ok := h.rooms[roomID]; ok {
					delete(clients, client)
					if len(clients) == 0 {
						delete(h.rooms, roomID)
					}
				}
			}
			close(client.send)

		case bm := <-h.broadcast:
			data, err := json.Marshal(bm.Payload)
			if err != nil {
				log.Println("json marshal error:", err)
				continue
			}

			if clients, ok := h.rooms[bm.RoomID]; ok {
				for client := range clients {
					select {
					case client.send <- bm.Payload:
					default:
						delete(clients, client)
						close(client.send)
						if len(clients) == 0 {
							delete(h.rooms, bm.RoomID)
						}
					}
				}
			}
			_ = data
		}
	}
}
