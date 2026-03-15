package message

import (
	"time"
)

type Message struct {
	MessageID   int64     `json:"message_id" db:"message_id"`
	RoomID      int64     `json:"room_id" db:"room_id"`
	MessengerID int64     `json:"messenger_id" db:"messenger_id"`
	Message     string    `json:"message" db:"message"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}
