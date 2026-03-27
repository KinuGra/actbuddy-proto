package room

import (
	"context"

	"github.com/google/uuid"
)

type RoomService struct {
	repo RoomRepository
}

func NewRoomService(repo RoomRepository) *RoomService {
	return &RoomService{repo: repo}
}

func (s *RoomService) GetRoomsByUserID(ctx context.Context, userID uuid.UUID) ([]*RoomWithPartner, error) {
	return s.repo.GetRoomsByUserID(ctx, userID)
}

func (s *RoomService) GetUserRoomIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	return s.repo.GetUserRoomIDs(ctx, userID)
}

func (s *RoomService) IsRoomMember(ctx context.Context, roomID, userID uuid.UUID) (bool, error) {
	return s.repo.IsRoomMember(ctx, roomID, userID)
}
