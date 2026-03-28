package room

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
)

func TestGetRoomsByUserID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock error: %s", err)
	}
	defer db.Close()

	repo := NewPostgresRepository(db)

	userID := uuid.New()
	partnerID := uuid.New()
	roomID := uuid.New()
	fixedTime := time.Date(2026, 3, 14, 12, 0, 0, 0, time.UTC)

	mock.ExpectQuery(`SELECT`).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "partner_id", "partner_name", "created_at"}).
			AddRow(roomID, partnerID, "テストパートナー", fixedTime))

	ctx := context.Background()
	rooms, err := repo.GetRoomsByUserID(ctx, userID)
	if err != nil {
		t.Errorf("unexpected error: %s", err)
	}

	if len(rooms) != 1 {
		t.Fatalf("expected 1 room, got %d", len(rooms))
	}

	if rooms[0].ID != roomID {
		t.Errorf("unexpected room ID: got %s want %s", rooms[0].ID, roomID)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %s", err)
	}
}

func TestGetUserRoomIDs(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock error: %s", err)
	}
	defer db.Close()

	repo := NewPostgresRepository(db)

	userID := uuid.New()
	roomID1 := uuid.New()
	roomID2 := uuid.New()

	mock.ExpectQuery(`SELECT room_id FROM room_members`).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"room_id"}).
			AddRow(roomID1).
			AddRow(roomID2))

	ctx := context.Background()
	roomIDs, err := repo.GetUserRoomIDs(ctx, userID)
	if err != nil {
		t.Errorf("unexpected error: %s", err)
	}

	if len(roomIDs) != 2 {
		t.Fatalf("expected 2 room IDs, got %d", len(roomIDs))
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %s", err)
	}
}
