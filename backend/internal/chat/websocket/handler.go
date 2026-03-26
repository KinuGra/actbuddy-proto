package websocket

// handle upgrader
// register client to hub
// send data to hub

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// upgrader: HTTP to websocket
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000"
	},
}

// upgrade HTTP to websocket and register client to hub
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println("Websocket upgrade error")
		return
	}

	// create Client
	client := NewClient(hub, conn, make(chan []byte, 256))
	hub.register <- client

	go client.writePump()
	client.readPump()
}
