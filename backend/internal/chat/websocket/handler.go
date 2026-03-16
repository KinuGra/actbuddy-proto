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
		return true
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
	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
	}
	hub.register <- client

	go client.writePump()
	client.readPump()
}
