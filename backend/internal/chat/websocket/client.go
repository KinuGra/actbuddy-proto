package websocket

import (
	"log"
	"github.com/gorilla/websocket"
)

type Client struct {
	hub *Hub
	conn *websocket.Conn
	send chan []byte
}

func NewClient(hub *Hub, conn *websocket.Conn, send chan []byte) *Client {
	return &Client{hub: hub, conn: conn, send: send}
}

func (c *Client) readPump() {

	// readPumpが終わる時に実行される関数
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	} ()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}
		log.Printf("Message received: %s", message)
		c.hub.broadcast <- message
	}
}

func (c *Client) writePump() {
	for message := range c.send {
		err := c.conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Println("Write error:", err)
		}

		log.Printf("Message sent: %s", message)
	}
}