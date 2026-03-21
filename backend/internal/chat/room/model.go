package room

import (
	"time"
)

type Room struct {
	RoomID    int64     `json:"room_id" db:"room_id"`
	UserID1   int64     `json:"user_id1" db:"user_id1"`
	UserID2   int64     `json:"user_id2" db:"user_id2"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}
