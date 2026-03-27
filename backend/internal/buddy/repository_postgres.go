package buddy

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

var (
	ErrProfileNotFound      = errors.New("buddy profile not found")
	ErrQueueEntryNotFound   = errors.New("queue entry not found")
	ErrRelationshipNotFound = errors.New("relationship not found")
)

type postgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

// --- プロフィール ---

func (r *postgresRepository) GetProfile(ctx context.Context, userID uuid.UUID) (*BuddyProfile, error) {
	p := &BuddyProfile{}
	err := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, bio, goal_types, active_times, created_at, updated_at
		FROM buddy_profiles WHERE user_id = $1
	`, userID).Scan(
		&p.ID, &p.UserID, &p.Bio,
		&p.GoalTypes, &p.ActiveTimes,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrProfileNotFound
	}
	return p, err
}

func (r *postgresRepository) UpsertProfile(ctx context.Context, userID uuid.UUID, req *UpsertProfileRequest) (*BuddyProfile, error) {
	p := &BuddyProfile{}
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO buddy_profiles (user_id, bio, goal_types, active_times)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id) DO UPDATE SET
			bio          = EXCLUDED.bio,
			goal_types   = EXCLUDED.goal_types,
			active_times = EXCLUDED.active_times
		RETURNING id, user_id, bio, goal_types, active_times, created_at, updated_at
	`, userID, req.Bio, pq.Array(req.GoalTypes), pq.Array(req.ActiveTimes)).Scan(
		&p.ID, &p.UserID, &p.Bio,
		&p.GoalTypes, &p.ActiveTimes,
		&p.CreatedAt, &p.UpdatedAt,
	)
	return p, err
}

// --- マッチングキュー ---

func (r *postgresRepository) GetQueueEntry(ctx context.Context, userID uuid.UUID) (*MatchingQueue, error) {
	q := &MatchingQueue{}
	err := r.db.QueryRowContext(ctx, `
		SELECT id, user_id, status, joined_at, expires_at
		FROM matching_queue WHERE user_id = $1
	`, userID).Scan(&q.ID, &q.UserID, &q.Status, &q.JoinedAt, &q.ExpiresAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrQueueEntryNotFound
	}
	return q, err
}

func (r *postgresRepository) JoinQueue(ctx context.Context, userID uuid.UUID) (*MatchingQueue, error) {
	// 既存エントリ確認
	existing, err := r.GetQueueEntry(ctx, userID)
	if err == nil {
		if existing.Status == "waiting" || existing.Status == "matched" {
			return nil, ErrAlreadyInQueue
		}
		// cancelled → 再参加
		q := &MatchingQueue{}
		err = r.db.QueryRowContext(ctx, `
			UPDATE matching_queue
			SET status = 'waiting', joined_at = NOW(), expires_at = NOW() + INTERVAL '7 days'
			WHERE user_id = $1
			RETURNING id, user_id, status, joined_at, expires_at
		`, userID).Scan(&q.ID, &q.UserID, &q.Status, &q.JoinedAt, &q.ExpiresAt)
		return q, err
	}

	// 新規 INSERT
	q := &MatchingQueue{}
	err = r.db.QueryRowContext(ctx, `
		INSERT INTO matching_queue (user_id)
		VALUES ($1)
		RETURNING id, user_id, status, joined_at, expires_at
	`, userID).Scan(&q.ID, &q.UserID, &q.Status, &q.JoinedAt, &q.ExpiresAt)
	return q, err
}

func (r *postgresRepository) LeaveQueue(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE matching_queue SET status = 'cancelled'
		WHERE user_id = $1 AND status = 'waiting'
	`, userID)
	return err
}

// --- マッチング ---

func (r *postgresRepository) GetWaitingCandidates(ctx context.Context) ([]*MatchingCandidate, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT mq.user_id, mq.joined_at, bp.goal_types, bp.active_times
		FROM matching_queue mq
		INNER JOIN buddy_profiles bp ON bp.user_id = mq.user_id
		WHERE mq.status = 'waiting' AND mq.expires_at > NOW()
		ORDER BY mq.joined_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var candidates []*MatchingCandidate
	for rows.Next() {
		c := &MatchingCandidate{}
		if err := rows.Scan(&c.UserID, &c.JoinedAt, &c.GoalTypes, &c.ActiveTimes); err != nil {
			return nil, err
		}
		candidates = append(candidates, c)
	}
	return candidates, rows.Err()
}

func (r *postgresRepository) CreateBuddyMatch(ctx context.Context, userID1, userID2 uuid.UUID) (*BuddyRelationship, uuid.UUID, error) {
	// DB の CHECK 制約に合わせて順序を保証
	if bytes.Compare(userID1[:], userID2[:]) > 0 {
		userID1, userID2 = userID2, userID1
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, uuid.Nil, err
	}
	defer tx.Rollback()

	// buddy_relationships 作成
	rel := &BuddyRelationship{}
	err = tx.QueryRowContext(ctx, `
		INSERT INTO buddy_relationships (user_id_1, user_id_2)
		VALUES ($1, $2)
		RETURNING id, user_id_1, user_id_2, status, matched_at, ends_at, ended_at
	`, userID1, userID2).Scan(
		&rel.ID, &rel.UserID1, &rel.UserID2, &rel.Status,
		&rel.MatchedAt, &rel.EndsAt, &rel.EndedAt,
	)
	if err != nil {
		return nil, uuid.Nil, err
	}

	// room 作成
	var roomID uuid.UUID
	if err = tx.QueryRowContext(ctx, `
		INSERT INTO rooms (buddy_relationship_id) VALUES ($1) RETURNING id
	`, rel.ID).Scan(&roomID); err != nil {
		return nil, uuid.Nil, err
	}

	// room_members 追加
	if _, err = tx.ExecContext(ctx, `
		INSERT INTO room_members (room_id, user_id) VALUES ($1, $2), ($1, $3)
	`, roomID, userID1, userID2); err != nil {
		return nil, uuid.Nil, err
	}

	// キューステータスを matched に更新
	if _, err = tx.ExecContext(ctx, `
		UPDATE matching_queue SET status = 'matched'
		WHERE user_id IN ($1, $2) AND status = 'waiting'
	`, userID1, userID2); err != nil {
		return nil, uuid.Nil, err
	}

	// 通知を作成
	name1, _ := getUserDisplayNameTx(ctx, tx, userID1)
	name2, _ := getUserDisplayNameTx(ctx, tx, userID2)

	if err = insertMatchNotification(ctx, tx, userID1, userID2, name2, roomID); err != nil {
		return nil, uuid.Nil, err
	}
	if err = insertMatchNotification(ctx, tx, userID2, userID1, name1, roomID); err != nil {
		return nil, uuid.Nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, uuid.Nil, err
	}
	return rel, roomID, nil
}

func insertMatchNotification(ctx context.Context, tx *sql.Tx, toUser, partnerID uuid.UUID, partnerName string, roomID uuid.UUID) error {
	type meta struct {
		BuddyID     string `json:"buddy_id"`
		RoomID      string `json:"room_id"`
		PartnerName string `json:"partner_name"`
	}
	metaBytes, _ := json.Marshal(meta{
		BuddyID:     partnerID.String(),
		RoomID:      roomID.String(),
		PartnerName: partnerName,
	})
	body := partnerName + " さんとマッチングしました🎉 今週1週間、一緒に頑張りましょう！"
	_, err := tx.ExecContext(ctx, `
		INSERT INTO notifications (user_id, type, title, body, metadata)
		VALUES ($1, 'match_found', 'バディが見つかりました！', $2, $3)
	`, toUser, body, metaBytes)
	return err
}

func getUserDisplayNameTx(ctx context.Context, tx *sql.Tx, userID uuid.UUID) (string, error) {
	var name string
	err := tx.QueryRowContext(ctx, `SELECT display_name FROM users WHERE id = $1`, userID).Scan(&name)
	return name, err
}

// --- バディ関係 ---

func (r *postgresRepository) GetActiveRelationships(ctx context.Context, userID uuid.UUID) ([]*BuddyRelationship, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, user_id_1, user_id_2, status, matched_at, ends_at, ended_at
		FROM buddy_relationships
		WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = 'active'
		ORDER BY matched_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rels []*BuddyRelationship
	for rows.Next() {
		rel := &BuddyRelationship{}
		if err := rows.Scan(&rel.ID, &rel.UserID1, &rel.UserID2, &rel.Status,
			&rel.MatchedAt, &rel.EndsAt, &rel.EndedAt); err != nil {
			return nil, err
		}
		rels = append(rels, rel)
	}
	return rels, rows.Err()
}

func (r *postgresRepository) GetRelationshipByID(ctx context.Context, id uuid.UUID) (*BuddyRelationship, error) {
	rel := &BuddyRelationship{}
	err := r.db.QueryRowContext(ctx, `
		SELECT id, user_id_1, user_id_2, status, matched_at, ends_at, ended_at
		FROM buddy_relationships WHERE id = $1
	`, id).Scan(&rel.ID, &rel.UserID1, &rel.UserID2, &rel.Status,
		&rel.MatchedAt, &rel.EndsAt, &rel.EndedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrRelationshipNotFound
	}
	return rel, err
}

func (r *postgresRepository) EndRelationship(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE buddy_relationships
		SET status = 'ended', ended_at = NOW()
		WHERE id = $1
	`, id)
	return err
}

func (r *postgresRepository) HasExistingRelationship(ctx context.Context, userID1, userID2 uuid.UUID) (bool, error) {
	if bytes.Compare(userID1[:], userID2[:]) > 0 {
		userID1, userID2 = userID2, userID1
	}
	var exists bool
	err := r.db.QueryRowContext(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM buddy_relationships
			WHERE user_id_1 = $1 AND user_id_2 = $2
		)
	`, userID1, userID2).Scan(&exists)
	return exists, err
}

func (r *postgresRepository) CountActiveRelationships(ctx context.Context, userID uuid.UUID) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM buddy_relationships
		WHERE (user_id_1 = $1 OR user_id_2 = $1)
		  AND status = 'active' AND ends_at > NOW()
	`, userID).Scan(&count)
	return count, err
}

// --- 補助 ---

func (r *postgresRepository) GetAchievementRate(ctx context.Context, userID uuid.UUID) (float64, error) {
	var achieved, total int
	err := r.db.QueryRowContext(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE status IN ('completed', 'progress_70')) AS achieved,
			COUNT(*) FILTER (WHERE kind != 'break') AS total
		FROM action_items
		WHERE user_id = $1
		  AND start_time >= NOW() - INTERVAL '7 days'
		  AND kind != 'break'
	`, userID).Scan(&achieved, &total)
	if err != nil {
		return 0, err
	}
	if total == 0 {
		return 0, nil
	}
	return float64(achieved) / float64(total), nil
}

func (r *postgresRepository) GetUserDisplayName(ctx context.Context, userID uuid.UUID) (string, error) {
	var name string
	err := r.db.QueryRowContext(ctx, `SELECT display_name FROM users WHERE id = $1`, userID).Scan(&name)
	return name, err
}

func (r *postgresRepository) GetRoomIDByRelationshipID(ctx context.Context, relationshipID uuid.UUID) (uuid.UUID, error) {
	var roomID uuid.UUID
	err := r.db.QueryRowContext(ctx, `
		SELECT id FROM rooms WHERE buddy_relationship_id = $1
	`, relationshipID).Scan(&roomID)
	if errors.Is(err, sql.ErrNoRows) {
		return uuid.Nil, errors.New("room not found")
	}
	return roomID, err
}
