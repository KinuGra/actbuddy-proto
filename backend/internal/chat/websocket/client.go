package websocket

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"time"
)

type Client struct {
	id   int64
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

type ReadMessage struct {
	RoomID   int64  `json:"room_id"`
	SenderID int64  `json:"sender_id"`
	Content  string `json:"content"`
}

type SavedMessage struct {
	MessageID  int64     `json:"message_id"`
	RoomID     int64     `json:"room_id"`
	SenderID   int64     `json:"sender_id"`
	SenderName string    `json:"sender_name"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
}

func NewClient(id int64, hub *Hub, conn *websocket.Conn, send chan []byte) *Client {
	return &Client{id: id, hub: hub, conn: conn, send: send}
}

func (c *Client) readPump() {

	// readPumpが終わる時に実行される関数
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, msgBytes, err := c.conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}
		var readMessage ReadMessage
		err = json.Unmarshal(msgBytes, &readMessage)
		if err != nil {
			log.Println("JSON unmarshal error:", err)
			continue
		}

		// サーバーに保存
		savedMessage := SavedMessage{
      MessageID:  generateUniqueMessageID(), // 例: データベースからのID、またはUUIDなど
			RoomID:     readMessage.RoomID,
			SenderID:   readMessage.SenderID,
			SenderName: "テストユーザー",
			Content:    readMessage.Content,
			CreatedAt:  time.Date(2026, 3, 14, 12, 0, 0, 0, time.UTC),
		}
		// サーバーから返ってきたデータをbroadcast
		log.Printf("Saved Message at DB as message_id :%d, room_id %d, sender_id %d, sender_name %s, content : %s, created_at : %v", savedMessage.MessageID, savedMessage.RoomID, savedMessage.SenderID, savedMessage.SenderName, savedMessage.Content, savedMessage.CreatedAt)
		c.hub.broadcast <- &savedMessage
	}
}

func (c *Client) writePump() {
	for savedMessage := range c.send {
		err := c.conn.WriteMessage(websocket.TextMessage, savedMessage)
		if err != nil {
			log.Println("Write error:", err)
		}

		log.Printf("Message sent: %s", savedMessage)
	}
}
