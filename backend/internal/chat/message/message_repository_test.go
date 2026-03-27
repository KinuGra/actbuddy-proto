package message

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
)

func TestSaveMessage(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock error: %s", err)
	}
	defer db.Close()

	repo := NewPostgresRepository(db)

	roomID := uuid.New()
	senderID := uuid.New()
	fixedTime := time.Date(2026, 3, 14, 12, 0, 0, 0, time.UTC)

	mock.ExpectQuery(`INSERT INTO messages`).
		WithArgs(roomID, senderID, "hello").
		WillReturnRows(sqlmock.NewRows([]string{"id", "room_id", "sender_id", "content", "created_at"}).
			AddRow(int64(123), roomID, senderID, "hello", fixedTime))

	msg, err := repo.SaveMessage(context.Background(), roomID, senderID, "hello")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	if msg.ID != 123 {
		t.Errorf("expected ID 123, got %d", msg.ID)
	}
	if msg.Content != "hello" {
		t.Errorf("expected content 'hello', got %s", msg.Content)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

func TestGetMessagesByRoomID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock error: %s", err)
	}
	defer db.Close()

	repo := NewPostgresRepository(db)

	roomID := uuid.New()
	senderID1 := uuid.New()
	senderID2 := uuid.New()
	fixedTime := time.Date(2026, 3, 14, 12, 0, 0, 0, time.UTC)

	mock.ExpectQuery(`SELECT m.id`).
		WithArgs(roomID, 100).
		WillReturnRows(sqlmock.NewRows([]string{"id", "room_id", "sender_id", "sender_name", "content", "created_at"}).
			AddRow(int64(1), roomID, senderID1, "ユーザーA", "hello", fixedTime).
			AddRow(int64(2), roomID, senderID2, "ユーザーB", "hi", fixedTime))

	messages, err := repo.GetMessagesByRoomID(context.Background(), roomID, 100)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	if len(messages) != 2 {
		t.Fatalf("expected 2 messages, got %d", len(messages))
	}

	if messages[0].Content != "hello" || messages[1].Content != "hi" {
		t.Errorf("unexpected message content")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}
