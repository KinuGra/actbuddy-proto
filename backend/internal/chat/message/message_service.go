package message

import (
	"context"
)

type MessageService struct {
	repo MessageRepository
}

func (s *MessageService) NewMessageService(repo MessageRepository) *MessageService {
	return &MessageService{repo: repo}
}

func (s *MessageService) SendMessage(ctx context.Context, roomID int64, userID int64, message string) (int64, error) {
	return s.repo.SendMessage(ctx, roomID, userID, message)
}

func (s *MessageService) GetMessageByRoomID(ctx context.Context, roomID int64) ([]*Message, error) {
	return s.repo.GetMessageByRoomID(ctx, roomID)
}
