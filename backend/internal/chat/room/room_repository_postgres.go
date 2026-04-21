package room

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) RoomRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) GetRoomsByUserID(ctx context.Context, userID uuid.UUID) ([]*RoomWithPartner, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT
			rm.room_id AS id,
			partner.user_id AS partner_id,
			u.display_name AS partner_name,
			ro.created_at,
			(
				SELECT COUNT(*)
				FROM messages m
				WHERE m.room_id = rm.room_id
				  AND m.sender_id != $1
				  AND (rm.last_read_message_id IS NULL OR m.id > rm.last_read_message_id)
			) AS unread_count
		FROM room_members rm
		INNER JOIN rooms ro ON ro.id = rm.room_id
		INNER JOIN room_members partner ON partner.room_id = rm.room_id AND partner.user_id != $1
		INNER JOIN users u ON u.id = partner.user_id
		WHERE rm.user_id = $1
		ORDER BY ro.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []*RoomWithPartner
	for rows.Next() {
		rp := &RoomWithPartner{}
		if err := rows.Scan(&rp.ID, &rp.PartnerID, &rp.PartnerName, &rp.CreatedAt, &rp.UnreadCount); err != nil {
			return nil, err
		}
		rooms = append(rooms, rp)
	}
	return rooms, rows.Err()
}

func (r *PostgresRepository) UpdateLastRead(ctx context.Context, roomID, userID uuid.UUID) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE room_members
		SET last_read_message_id = (SELECT MAX(id) FROM messages WHERE room_id = $1)
		WHERE room_id = $1 AND user_id = $2
	`, roomID, userID)
	return err
}

func (r *PostgresRepository) GetUserRoomIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT room_id FROM room_members WHERE user_id = $1
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roomIDs []uuid.UUID
	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		roomIDs = append(roomIDs, id)
	}
	return roomIDs, rows.Err()
}

func (r *PostgresRepository) IsRoomMember(ctx context.Context, roomID, userID uuid.UUID) (bool, error) {
	var exists bool
	err := r.db.QueryRowContext(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2
		)
	`, roomID, userID).Scan(&exists)
	return exists, err
}
