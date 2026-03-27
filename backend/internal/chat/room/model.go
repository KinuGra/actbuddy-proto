package room

import (
	"time"
)

type Room struct {
	RoomID    string     `json:"room_id" db:"room_id"`
	UserID1   string     `json:"user_id1" db:"user_id1"`
	UserID2   string     `json:"user_id2" db:"user_id2"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}
