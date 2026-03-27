package message

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) MessageRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) SaveMessage(ctx context.Context, roomID, senderID uuid.UUID, content string) (*Message, error) {
	msg := &Message{}
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO messages (room_id, sender_id, content)
		VALUES ($1, $2, $3)
		RETURNING id, room_id, sender_id, content, created_at
	`, roomID, senderID, content).Scan(
		&msg.ID, &msg.RoomID, &msg.SenderID, &msg.Content, &msg.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	// SenderName はリポジトリ外で設定
	return msg, nil
}

func (r *PostgresRepository) GetMessagesByRoomID(ctx context.Context, roomID uuid.UUID, limit int) ([]*Message, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT m.id, m.room_id, m.sender_id, u.display_name AS sender_name, m.content, m.created_at
		FROM messages m
		INNER JOIN users u ON u.id = m.sender_id
		WHERE m.room_id = $1
		ORDER BY m.created_at ASC
		LIMIT $2
	`, roomID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*Message
	for rows.Next() {
		msg := &Message{}
		if err := rows.Scan(&msg.ID, &msg.RoomID, &msg.SenderID, &msg.SenderName, &msg.Content, &msg.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, rows.Err()
}
