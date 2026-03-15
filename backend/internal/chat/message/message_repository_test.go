package message

import (
	"context"
	"github.com/DATA-DOG/go-sqlmock"
	"testing"
	"time"
)

func TestSendMessage(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	repo := NewPostgresRepository(db)

	mock.ExpectQuery(`INSERT INTO messages.*RETURNING message_id`).
		WithArgs(int64(1), int64(2), "hello").
		WillReturnRows(sqlmock.NewRows([]string{"message_id"}).AddRow(123))

	id, err := repo.SendMessage(context.Background(), 1, 2, "hello")
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if id != 123 {
		t.Errorf("expected id 123, got %d", id)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}

func TestGetMessageByRoomID(t *testing.T) {
db, mock, err := sqlmock.New()
if err != nil {
	t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
}
	defer db.Close()

	repo := NewPostgresRepository(db)

	fixedTime := time.Date(2026, 3, 14, 12, 0, 0, 0, time.UTC)

	mock.ExpectQuery(`SELECT message_id, room_id, messenger_id, message, created_at FROM messages WHERE room_id = $1`).
		WithArgs(int64(1)).
		WillReturnRows(sqlmock.NewRows([]string{"message_id", "room_id", "messenger_id", "message", "created_at"}).
			AddRow(1, 1, 2, "hello", fixedTime).
			AddRow(2, 1, 3, "hi", fixedTime),
		)

	messages, err := repo.GetMessageByRoomID(context.Background(), 1)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}

	if len(messages) != 2 {
		t.Errorf("expected 2 messages, got %d", len(messages))
	}

	expected := []*Message{
		{MessageID: 1, RoomID: 1, MessengerID: 2, Message: "hello", CreatedAt: fixedTime},
		{MessageID: 2, RoomID: 1, MessengerID: 3, Message: "hi", CreatedAt: fixedTime},
	}

	for i, m := range messages {
		if expected[i].MessageID != m.MessageID || expected[i].RoomID != m.RoomID || expected[i].MessengerID != m.MessengerID || expected[i].Message != m.Message || expected[i].CreatedAt != fixedTime {
			t.Errorf("unexpected room at index %d.\ngot:  %+v\nwant: %+v", i, m, expected[i])
		}
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %v", err)
	}
}
