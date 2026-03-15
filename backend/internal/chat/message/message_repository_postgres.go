package message

import (
	"context"
	"database/sql"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) MessageRepository {
	return &PostgresRepository{db:db}
}

func (r *PostgresRepository) SendMessage(ctx context.Context, roomID int64, userID int64, message string) (int64, error) {
	query := `
	INSERT INTO messages (room_id, messenger_id, message) VALUES($1, $2, $3)
	RETURNING message_id
	`

	var messageID int64

	err := r.db.QueryRowContext(ctx, query,roomID, userID, message).Scan(&messageID)

	if err != nil {
		return 0, err
	}

	return messageID, nil
}

func (r *PostgresRepository) GetMessageByRoomID (ctx context.Context, roomID int64) ([]*Message, error) {
	query := `
	SELECT message_id, room_id, messenger_id, message, created_at FROM messages
	WHERE room_id = $1
	`

	rows, err := r.db.QueryContext(ctx, query, roomID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*Message
	for rows.Next() {
		var message Message
		if err := rows.Scan(&message.MessageID, &message.RoomID, &message.MessengerID, &message.Message, &message.CreatedAt); err!= nil {
			return nil, err
		}

		messages = append(messages, &message)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return messages, nil
}