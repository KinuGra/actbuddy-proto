package task

import (
	"time"

	"github.com/google/uuid"
)

type ActionItemStatus string

const (
	ActionItemStatusCompleted  ActionItemStatus = "completed"   // 完了
	ActionItemStatusProgress70 ActionItemStatus = "progress_70" // 70%
	ActionItemStatusProgress30 ActionItemStatus = "progress_30" // 30%
	ActionItemStatusNotStarted ActionItemStatus = "not_started" // 未完了
)

type ActionItem struct {
	ID          int64            `db:"id"`
	UUID        uuid.UUID        `db:"uuid"`
	UserID      uuid.UUID        `db:"user_id"`
	Title       string           `db:"title"`
	Description string           `db:"description"`
	StartTime   time.Time        `db:"start_time"`
	EndTime     time.Time        `db:"end_time"`
	Kind        string           `db:"kind"`
	Status      ActionItemStatus `db:"status"`
	CreatedAt   time.Time        `db:"created_at"`
	UpdatedAt   time.Time        `db:"updated_at"`
}

type CreateRequest struct {
	UserID      string           `json:"user_id"      binding:"omitempty,uuid"`
	Title       string           `json:"title"        binding:"required"`
	Description string           `json:"description"`
	StartTime   time.Time        `json:"start_time"   binding:"required"`
	EndTime     time.Time        `json:"end_time"     binding:"required"`
	Kind        string           `json:"kind"         binding:"required"`
	Status      ActionItemStatus `json:"status"       binding:"required"`
}

type UpdateRequest struct {
	Title       *string           `json:"title"`
	Description *string           `json:"description"`
	StartTime   *time.Time        `json:"start_time"`
	EndTime     *time.Time        `json:"end_time"`
	Kind        *string           `json:"kind"`
	Status      *ActionItemStatus `json:"status"`
}

type ActionItemResponse struct {
	UUID        string           `json:"uuid"`
	UserID      string           `json:"user_id"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	StartTime   time.Time        `json:"start_time"`
	EndTime     time.Time        `json:"end_time"`
	Kind        string           `json:"kind"`
	Status      ActionItemStatus `json:"status"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

func toResponse(item *ActionItem) *ActionItemResponse {
	return &ActionItemResponse{
		UUID:        item.UUID.String(),
		UserID:      item.UserID.String(),
		Title:       item.Title,
		Description: item.Description,
		StartTime:   item.StartTime,
		EndTime:     item.EndTime,
		Kind:        item.Kind,
		Status:      item.Status,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
	}
}
