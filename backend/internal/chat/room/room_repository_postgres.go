package room

import (
	"context"
	"database/sql"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) RoomRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) CreateRoom(ctx context.Context, userID1, userID2 int64) (int64, error) {
	query := `
	INSERT INTO rooms (user_id1, user_id2)
	VALUES ($1, $2)
	RETURNING room_id
	`

	var roomID int64

	err := r.db.QueryRowContext(ctx, query, userID1, userID2).Scan(&roomID)
	if err != nil {
		return 0, err
	}

	return roomID, nil
}

func (r *PostgresRepository) GetRoomByID(ctx context.Context, roomID int64) (*Room, error) {

	query := `
	SELECT room_id, user_id1, user_id2, created_at
	FROM rooms
	WHERE room_id = $1
	`

	var room Room

	err := r.db.QueryRowContext(ctx, query, roomID).
		Scan(&room.RoomID, &room.UserID1, &room.UserID2, &room.CreatedAt)

	if err != nil {
		return nil, err
	}

	return &room, nil
}

func (r *PostgresRepository) GetRoomByUser(ctx context.Context, userID int64) ([]*Room, error) {
	query := `
	SELECT room_id, user_id1, user_id2, created_at
	FROM rooms
	WHERE user_id1 = $1 OR user_id2 = $1
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []*Room
	for rows.Next() {
		var room Room
		if err := rows.Scan(&room.RoomID, &room.UserID1, &room.UserID2, &room.CreatedAt); err != nil {
			return nil, err
		}
		rooms = append(rooms, &room)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return rooms, nil
}
