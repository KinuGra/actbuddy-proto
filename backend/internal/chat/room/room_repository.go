package room

import "context"

type RoomRepository interface {
	CreateRoom(ctx context.Context, userID1, userID2 int64) (int64, error)
	GetRoomByID(ctx context.Context, roomID int64) (*Room, error)
	GetRoomByUser(ctx context.Context, userID int64) ([]*Room, error)
}