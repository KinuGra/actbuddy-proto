package websocket

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"backend/internal/chat/message"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Client struct {
	userID      uuid.UUID
	displayName string
	roomIDs     []uuid.UUID
	hub         *Hub
	conn        *websocket.Conn
	send        chan []byte
	msgSvc      *message.MessageService
}

// IncomingMessage はクライアントから受け取るメッセージ形式
type IncomingMessage struct {
	RoomID  string `json:"room_id"`
	Content string `json:"content"`
}

// OutgoingMessage はクライアントへ送るメッセージ形式
type OutgoingMessage struct {
	ID         int64     `json:"id"`
	RoomID     string    `json:"room_id"`
	SenderID   string    `json:"sender_id"`
	SenderName string    `json:"sender_name"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"created_at"`
}

func NewClient(userID uuid.UUID, displayName string, roomIDs []uuid.UUID, hub *Hub, conn *websocket.Conn, send chan []byte, msgSvc *message.MessageService) *Client {
	return &Client{
		userID:      userID,
		displayName: displayName,
		roomIDs:     roomIDs,
		hub:         hub,
		conn:        conn,
		send:        send,
		msgSvc:      msgSvc,
	}
}

func (c *Client) readPump() {
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

		var incoming IncomingMessage
		if err := json.Unmarshal(msgBytes, &incoming); err != nil {
			log.Println("JSON unmarshal error:", err)
			continue
		}

		roomID, err := uuid.Parse(incoming.RoomID)
		if err != nil {
			log.Println("invalid room_id:", err)
			continue
		}

		// ルームメンバーシップ確認
		isMember := false
		for _, id := range c.roomIDs {
			if id == roomID {
				isMember = true
				break
			}
		}
		if !isMember {
			log.Printf("user %s is not a member of room %s", c.userID, roomID)
			continue
		}

		// DB に保存
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		saved, err := c.msgSvc.SaveMessage(ctx, roomID, c.userID, incoming.Content)
		cancel()
		if err != nil {
			log.Println("SaveMessage error:", err)
			continue
		}

		outgoing := &OutgoingMessage{
			ID:         saved.ID,
			RoomID:     roomID.String(),
			SenderID:   c.userID.String(),
			SenderName: c.displayName,
			Content:    saved.Content,
			CreatedAt:  saved.CreatedAt,
		}

		payload, err := json.Marshal(outgoing)
		if err != nil {
			log.Println("json marshal error:", err)
			continue
		}

		c.hub.broadcast <- &BroadcastMessage{
			RoomID:  roomID,
			Payload: payload,
		}
	}
}

func (c *Client) writePump() {
	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			log.Println("Write error:", err)
		}
	}
}
