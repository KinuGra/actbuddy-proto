package room

import (
	"context"
)

type RoomService struct {
	repo RoomRepository
}

func NewRoomService(repo RoomRepository) *RoomService {
	return &RoomService{repo: repo}
}

func (s *RoomService) CreateRoom(ctx context.Context, userID1, userID2 string) (string, error) {
	return s.repo.CreateRoom(ctx, userID1, userID2)
}

func (s *RoomService) GetRoomByID(ctx context.Context, roomID string) (*Room, error) {
	return s.repo.GetRoomByID(ctx, roomID)
}

func (s *RoomService) GetRoomByUser(ctx context.Context, userID string) ([]*Room, error) {
	return s.repo.GetRoomByUser(ctx, userID)
}
