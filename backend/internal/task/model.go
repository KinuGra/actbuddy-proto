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
	ID          int64            `db:"id"`          // auto increment
	UUID        uuid.UUID        `db:"uuid"`        // UUID
	UserID      uuid.UUID        `db:"user_id"`     // リレーション
	Title       string           `db:"title"`
	Description string           `db:"description"`
	StartTime   time.Time        `db:"start_time"`
	EndTime     time.Time        `db:"end_time"`
	Kind        string           `db:"kind"`
	Status      ActionItemStatus `db:"status"`
	CreatedAt   time.Time        `db:"created_at"`
	UpdatedAt   time.Time        `db:"updated_at"`
}
