package room

import "context"

type Repository interface {
	CreateRoom(ctx context.Context, userID1, userID2 int64) (int64, error)
	GetRoomByID(ctx context.Context, roomID int64) (*Room, error)
	GetRoomByUsers(ctx context.Context, userID1, userID2 int64) (*Room, error)
}