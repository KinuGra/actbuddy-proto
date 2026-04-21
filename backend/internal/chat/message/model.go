package message

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID         int64     `db:"id"`
	RoomID     uuid.UUID `db:"room_id"`
	SenderID   uuid.UUID `db:"sender_id"`
	SenderName string    `db:"sender_name"`
	Content    string    `db:"content"`
	CreatedAt  time.Time `db:"created_at"`
}
