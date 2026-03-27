package buddy

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// --- DB モデル ---

type BuddyProfile struct {
	ID          uuid.UUID      `db:"id"`
	UserID      uuid.UUID      `db:"user_id"`
	Bio         string         `db:"bio"`
	GoalTypes   pq.StringArray `db:"goal_types"`
	ActiveTimes pq.StringArray `db:"active_times"`
	CreatedAt   time.Time      `db:"created_at"`
	UpdatedAt   time.Time      `db:"updated_at"`
}

type MatchingQueue struct {
	ID        uuid.UUID `db:"id"`
	UserID    uuid.UUID `db:"user_id"`
	Status    string    `db:"status"`
	JoinedAt  time.Time `db:"joined_at"`
	ExpiresAt time.Time `db:"expires_at"`
}

type BuddyRelationship struct {
	ID        uuid.UUID  `db:"id"`
	UserID1   uuid.UUID  `db:"user_id_1"`
	UserID2   uuid.UUID  `db:"user_id_2"`
	Status    string     `db:"status"`
	MatchedAt time.Time  `db:"matched_at"`
	EndsAt    time.Time  `db:"ends_at"`
	EndedAt   *time.Time `db:"ended_at"`
}

// MatchingCandidate はマッチングアルゴリズムの内部処理用
type MatchingCandidate struct {
	UserID      uuid.UUID
	JoinedAt    time.Time
	GoalTypes   pq.StringArray
	ActiveTimes pq.StringArray
}

// --- リクエスト ---

type UpsertProfileRequest struct {
	Bio         string   `json:"bio"`
	GoalTypes   []string `json:"goal_types" binding:"required"`
	ActiveTimes []string `json:"active_times" binding:"required"`
}

// --- レスポンス ---

type ProfileResponse struct {
	ID          string   `json:"id"`
	UserID      string   `json:"user_id"`
	Bio         string   `json:"bio"`
	GoalTypes   []string `json:"goal_types"`
	ActiveTimes []string `json:"active_times"`
}

type QueueStatusResponse struct {
	InQueue   bool       `json:"in_queue"`
	Status    string     `json:"status,omitempty"`
	JoinedAt  *time.Time `json:"joined_at,omitempty"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

type PartnerInfo struct {
	ID          string `json:"id"`
	DisplayName string `json:"display_name"`
}

type BuddyRelationshipResponse struct {
	ID        string      `json:"id"`
	Partner   PartnerInfo `json:"partner"`
	Status    string      `json:"status"`
	MatchedAt time.Time   `json:"matched_at"`
	EndsAt    time.Time   `json:"ends_at"`
	RoomID    string      `json:"room_id"`
}

type BuddyCapacityResponse struct {
	CurrentCount    int     `json:"current_count"`
	MaxCount        int     `json:"max_count"`
	AchievementRate float64 `json:"achievement_rate"`
}
