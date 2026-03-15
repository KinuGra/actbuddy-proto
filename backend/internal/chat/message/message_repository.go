package message

import "context"

type MessageRepository interface {
	SendMessage(ctx context.Context, roomID int64, userID int64, message string) (int64, error)
	GetMessageByRoomID(ctx context.Context, roomID int64) ([]*Message, error)
}
