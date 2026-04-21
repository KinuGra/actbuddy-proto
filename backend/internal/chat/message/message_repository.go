package message

import (
	"context"

	"github.com/google/uuid"
)

type MessageRepository interface {
	SaveMessage(ctx context.Context, roomID, senderID uuid.UUID, content string) (*Message, error)
	GetMessagesByRoomID(ctx context.Context, roomID uuid.UUID, limit int) ([]*Message, error)
}
