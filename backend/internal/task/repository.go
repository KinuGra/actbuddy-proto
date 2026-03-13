package task

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	FindByUUID(ctx context.Context, uuid uuid.UUID) (*ActionItem, error)
	Update(ctx context.Context, item *ActionItem) (*ActionItem, error)
	Delete(ctx context.Context, uuid uuid.UUID) error
}
