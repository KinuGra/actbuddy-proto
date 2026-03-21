package task

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
)

type postgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(db *sql.DB) Repository {
	return &postgresRepository{db: db}
}

func (r *postgresRepository) Create(ctx context.Context, item *ActionItem) (*ActionItem, error) {
	item.UUID = uuid.New()
	err := r.db.QueryRowContext(ctx, `
		INSERT INTO action_items (uuid, user_id, title, description, start_time, end_time, kind, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, uuid, user_id, title, description, start_time, end_time, kind, status, created_at, updated_at
	`,
		item.UUID, item.UserID, item.Title, item.Description,
		item.StartTime, item.EndTime, item.Kind, item.Status,
	).Scan(
		&item.ID, &item.UUID, &item.UserID,
		&item.Title, &item.Description,
		&item.StartTime, &item.EndTime,
		&item.Kind, &item.Status,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *postgresRepository) FindByUUID(ctx context.Context, id uuid.UUID) (*ActionItem, error) {
	item := &ActionItem{}
	err := r.db.QueryRowContext(ctx, `
		SELECT id, uuid, user_id, title, description, start_time, end_time, kind, status, created_at, updated_at
		FROM action_items WHERE uuid = $1
	`, id).Scan(
		&item.ID, &item.UUID, &item.UserID,
		&item.Title, &item.Description,
		&item.StartTime, &item.EndTime,
		&item.Kind, &item.Status,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *postgresRepository) Update(ctx context.Context, item *ActionItem) (*ActionItem, error) {
	item.UpdatedAt = time.Now().UTC()
	err := r.db.QueryRowContext(ctx, `
		UPDATE action_items
		SET title=$1, description=$2, start_time=$3, end_time=$4, kind=$5, status=$6, updated_at=$7
		WHERE uuid=$8
		RETURNING id, uuid, user_id, title, description, start_time, end_time, kind, status, created_at, updated_at
	`,
		item.Title, item.Description, item.StartTime, item.EndTime,
		item.Kind, item.Status, item.UpdatedAt, item.UUID,
	).Scan(
		&item.ID, &item.UUID, &item.UserID,
		&item.Title, &item.Description,
		&item.StartTime, &item.EndTime,
		&item.Kind, &item.Status,
		&item.CreatedAt, &item.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *postgresRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*ActionItem, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, uuid, user_id, title, description, start_time, end_time, kind, status, created_at, updated_at
		FROM action_items WHERE user_id = $1
		ORDER BY start_time ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*ActionItem
	for rows.Next() {
		item := &ActionItem{}
		if err := rows.Scan(
			&item.ID, &item.UUID, &item.UserID,
			&item.Title, &item.Description,
			&item.StartTime, &item.EndTime,
			&item.Kind, &item.Status,
			&item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *postgresRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM action_items WHERE uuid = $1`, id)
	if err != nil {
		return err
	}
	n, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return ErrNotFound
	}
	return nil
}
