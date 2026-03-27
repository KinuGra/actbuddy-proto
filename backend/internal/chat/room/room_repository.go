package room

import "context"

type RoomRepository interface {
	CreateRoom(ctx context.Context, userID1, userID2 string) (string, error)
	GetRoomByID(ctx context.Context, roomID string) (*Room, error)
	GetRoomByUser(ctx context.Context, userID string) ([]*Room, error)
}
