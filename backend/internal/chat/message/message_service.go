package message

import (
	"context"

	"github.com/google/uuid"
)

type MessageService struct {
	repo MessageRepository
}

func NewMessageService(repo MessageRepository) *MessageService {
	return &MessageService{repo: repo}
}

func (s *MessageService) SaveMessage(ctx context.Context, roomID, senderID uuid.UUID, content string) (*Message, error) {
	return s.repo.SaveMessage(ctx, roomID, senderID, content)
}

func (s *MessageService) GetMessagesByRoomID(ctx context.Context, roomID uuid.UUID, limit int) ([]*Message, error) {
	return s.repo.GetMessagesByRoomID(ctx, roomID, limit)
}
