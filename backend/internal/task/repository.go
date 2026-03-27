package task

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, item *ActionItem) (*ActionItem, error)
	FindByUUID(ctx context.Context, uuid uuid.UUID) (*ActionItem, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*ActionItem, error)
	FindByUserIDAsPartner(ctx context.Context, requesterID uuid.UUID, targetUserID uuid.UUID) ([]*ActionItem, error)
	Update(ctx context.Context, item *ActionItem) (*ActionItem, error)
	Delete(ctx context.Context, uuid uuid.UUID) error
}
