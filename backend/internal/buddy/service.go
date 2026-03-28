package buddy

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var (
	ErrAlreadyInQueue      = errors.New("already in matching queue")
	ErrProfileRequired     = errors.New("buddy profile is required to join the queue")
	ErrBuddyCapacityFull   = errors.New("buddy capacity is full")
	ErrRelationshipActive  = errors.New("relationship is still active")
	ErrNotRelationshipMember = errors.New("not a member of this relationship")
)

const maxBuddyCount = 3

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

// --- プロフィール ---

func (s *Service) GetProfile(ctx context.Context, userID uuid.UUID) (*ProfileResponse, error) {
	p, err := s.repo.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}
	return toProfileResponse(p), nil
}

func (s *Service) UpsertProfile(ctx context.Context, userID uuid.UUID, req *UpsertProfileRequest) (*ProfileResponse, error) {
	p, err := s.repo.UpsertProfile(ctx, userID, req)
	if err != nil {
		return nil, err
	}
	return toProfileResponse(p), nil
}

// --- マッチングキュー ---

func (s *Service) GetQueueStatus(ctx context.Context, userID uuid.UUID) (*QueueStatusResponse, error) {
	q, err := s.repo.GetQueueEntry(ctx, userID)
	if errors.Is(err, ErrQueueEntryNotFound) {
		return &QueueStatusResponse{InQueue: false}, nil
	}
	if err != nil {
		return nil, err
	}
	return &QueueStatusResponse{
		InQueue:   true,
		Status:    q.Status,
		JoinedAt:  &q.JoinedAt,
		ExpiresAt: &q.ExpiresAt,
	}, nil
}

func (s *Service) JoinQueue(ctx context.Context, userID uuid.UUID) (*MatchingQueue, error) {
	// プロフィール必須チェック
	if _, err := s.repo.GetProfile(ctx, userID); errors.Is(err, ErrProfileNotFound) {
		return nil, ErrProfileRequired
	} else if err != nil {
		return nil, err
	}

	// バディ数上限チェック
	capacity, err := s.GetBuddyCapacity(ctx, userID)
	if err != nil {
		return nil, err
	}
	if capacity.CurrentCount >= capacity.MaxCount {
		return nil, ErrBuddyCapacityFull
	}

	return s.repo.JoinQueue(ctx, userID)
}

func (s *Service) LeaveQueue(ctx context.Context, userID uuid.UUID) error {
	return s.repo.LeaveQueue(ctx, userID)
}

// --- バディ関係 ---

func (s *Service) GetRelationships(ctx context.Context, userID uuid.UUID) ([]*BuddyRelationshipResponse, error) {
	rels, err := s.repo.GetActiveRelationships(ctx, userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*BuddyRelationshipResponse, 0, len(rels))
	for _, rel := range rels {
		partnerID := rel.UserID1
		if rel.UserID1 == userID {
			partnerID = rel.UserID2
		}

		partnerName, _ := s.repo.GetUserDisplayName(ctx, partnerID)
		roomID, _ := s.repo.GetRoomIDByRelationshipID(ctx, rel.ID)

		responses = append(responses, &BuddyRelationshipResponse{
			ID: rel.ID.String(),
			Partner: PartnerInfo{
				ID:          partnerID.String(),
				DisplayName: partnerName,
			},
			Status:    rel.Status,
			MatchedAt: rel.MatchedAt,
			EndsAt:    rel.EndsAt,
			RoomID:    roomID.String(),
		})
	}
	return responses, nil
}

func (s *Service) EndRelationship(ctx context.Context, userID, relationshipID uuid.UUID) error {
	rel, err := s.repo.GetRelationshipByID(ctx, relationshipID)
	if err != nil {
		return err
	}
	if rel.UserID1 != userID && rel.UserID2 != userID {
		return ErrNotRelationshipMember
	}
	return s.repo.EndRelationship(ctx, relationshipID)
}

// --- バディ上限 ---

func (s *Service) GetBuddyCapacity(ctx context.Context, userID uuid.UUID) (*BuddyCapacityResponse, error) {
	count, err := s.repo.CountActiveRelationships(ctx, userID)
	if err != nil {
		return nil, err
	}

	rate, err := s.repo.GetAchievementRate(ctx, userID)
	if err != nil {
		return nil, err
	}

	maxCount := achievementRateToMaxCount(rate)
	return &BuddyCapacityResponse{
		CurrentCount:    count,
		MaxCount:        maxCount,
		AchievementRate: rate,
	}, nil
}

// achievementRateToMaxCount は達成率からバディ上限数を返す
func achievementRateToMaxCount(rate float64) int {
	switch {
	case rate >= 0.70:
		return 3
	case rate >= 0.40:
		return 2
	default:
		return 1
	}
}

// --- マッチングアルゴリズム ---

// RunMatching はマッチング待機中の全ユーザーに対してマッチングを実行する
func (s *Service) RunMatching(ctx context.Context) error {
	candidates, err := s.repo.GetWaitingCandidates(ctx)
	if err != nil {
		return err
	}

	matched := make(map[uuid.UUID]bool)

	for i := 0; i < len(candidates); i++ {
		a := candidates[i]
		if matched[a.UserID] {
			continue
		}

		bestScore := -1
		bestIdx := -1

		for j := i + 1; j < len(candidates); j++ {
			b := candidates[j]
			if matched[b.UserID] {
				continue
			}

			// 同じペアの既存関係チェック
			exists, err := s.repo.HasExistingRelationship(ctx, a.UserID, b.UserID)
			if err != nil || exists {
				continue
			}

			// バディ上限チェック（両者）
			capA, err := s.GetBuddyCapacity(ctx, a.UserID)
			if err != nil || capA.CurrentCount >= capA.MaxCount {
				continue
			}
			capB, err := s.GetBuddyCapacity(ctx, b.UserID)
			if err != nil || capB.CurrentCount >= capB.MaxCount {
				continue
			}

			score := calculateScore(a, b)
			if score > bestScore {
				bestScore = score
				bestIdx = j
			}
		}

		if bestIdx >= 0 {
			b := candidates[bestIdx]
			if _, _, err := s.repo.CreateBuddyMatch(ctx, a.UserID, b.UserID); err == nil {
				matched[a.UserID] = true
				matched[b.UserID] = true
			}
		}
	}

	return nil
}

// calculateScore はマッチングスコアを計算する
// goal_types の一致数 × 3 + active_times の一致数 × 2 + 待機ボーナス（先着順）
func calculateScore(a, b *MatchingCandidate) int {
	score := 0

	goalSet := make(map[string]bool)
	for _, g := range a.GoalTypes {
		goalSet[g] = true
	}
	for _, g := range b.GoalTypes {
		if goalSet[g] {
			score += 3
		}
	}

	timeSet := make(map[string]bool)
	for _, t := range a.ActiveTimes {
		timeSet[t] = true
	}
	for _, t := range b.ActiveTimes {
		if timeSet[t] {
			score += 2
		}
	}

	return score
}

// --- ヘルパー ---

func toProfileResponse(p *BuddyProfile) *ProfileResponse {
	return &ProfileResponse{
		ID:          p.ID.String(),
		UserID:      p.UserID.String(),
		Bio:         p.Bio,
		GoalTypes:   []string(p.GoalTypes),
		ActiveTimes: []string(p.ActiveTimes),
	}
}
