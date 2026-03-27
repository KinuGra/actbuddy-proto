package buddy

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	// プロフィール
	GetProfile(ctx context.Context, userID uuid.UUID) (*BuddyProfile, error)
	UpsertProfile(ctx context.Context, userID uuid.UUID, req *UpsertProfileRequest) (*BuddyProfile, error)

	// マッチングキュー
	GetQueueEntry(ctx context.Context, userID uuid.UUID) (*MatchingQueue, error)
	JoinQueue(ctx context.Context, userID uuid.UUID) (*MatchingQueue, error)
	LeaveQueue(ctx context.Context, userID uuid.UUID) error

	// マッチング実行（バックグラウンドジョブから呼ぶ）
	GetWaitingCandidates(ctx context.Context) ([]*MatchingCandidate, error)
	CreateBuddyMatch(ctx context.Context, userID1, userID2 uuid.UUID) (*BuddyRelationship, uuid.UUID, error)

	// バディ関係
	GetActiveRelationships(ctx context.Context, userID uuid.UUID) ([]*BuddyRelationship, error)
	GetRelationshipByID(ctx context.Context, id uuid.UUID) (*BuddyRelationship, error)
	EndRelationship(ctx context.Context, id uuid.UUID) error
	HasExistingRelationship(ctx context.Context, userID1, userID2 uuid.UUID) (bool, error)
	CountActiveRelationships(ctx context.Context, userID uuid.UUID) (int, error)

	// 補助
	GetAchievementRate(ctx context.Context, userID uuid.UUID) (float64, error)
	GetUserDisplayName(ctx context.Context, userID uuid.UUID) (string, error)
	GetRoomIDByRelationshipID(ctx context.Context, relationshipID uuid.UUID) (uuid.UUID, error)
}
