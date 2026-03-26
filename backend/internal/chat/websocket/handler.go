package websocket

// handle upgrader
// register client to hub
// send data to hub

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"strconv"
)

// upgrader: HTTP to websocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")

		// 開発用
		if origin == "http://localhost:3000" {
			return true
		}

		// websocket_test.go用
		if origin == "" {
			return true
		}

		return false
	},
}

// upgrade HTTP to websocket and register client to hub
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("userId")

	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		log.Println("invalid userId:", err)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println("Websocket upgrade error")
		return
	}

	// create Client
	client := NewClient(userID, hub, conn, make(chan []byte, 256))
	hub.register <- client

	go client.writePump()
	client.readPump()
}
