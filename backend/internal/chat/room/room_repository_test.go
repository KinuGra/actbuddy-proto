package room

import (
	"context"
	"github.com/DATA-DOG/go-sqlmock"
	"testing"
	"time"
)

func TestCreateRoom(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	repo := NewPostgresRepository(db)

	// モックするクエリと返す値
	mock.ExpectQuery("INSERT INTO rooms").
		WithArgs(int64(1), int64(2)).
		WillReturnRows(sqlmock.NewRows([]string{"room_id"}).AddRow(123))

	ctx := context.Background()
	roomID, err := repo.CreateRoom(ctx, 1, 2)
	if err != nil {
		t.Errorf("unexpected error: %s", err)
	}

	if roomID != 123 {
		t.Errorf("expected roomID 123, got %d", roomID)
	}

	// モックの期待値が満たされているかチェック
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestGetRoomByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	repo := NewPostgresRepository(db)

	fixedTime := time.Date(2026, 3, 14, 12, 0, 0, 0, time.UTC)

	// モックするクエリと返す値
	mock.ExpectQuery(`SELECT room_id, user_id1, user_id2, created_at
	  FROM rooms
	  WHERE room_id = \$1`).
		WithArgs(int64(123)).
		WillReturnRows(sqlmock.NewRows([]string{"room_id", "user_id1", "user_id2", "created_at"}).
			AddRow(123, 10, 20, fixedTime))

	ctx := context.Background()
	room, err := repo.GetRoomByID(ctx, 123)
	if err != nil {
		t.Errorf("unexpected error: %s", err)
	}

	if room.RoomID != 123 || room.UserID1 != 10 || room.UserID2 != 20 || room.CreatedAt != fixedTime {
		t.Errorf(
			"expected roomID=123, userID1=10, userID2=20, CreatedAt=%v, got roomID=%d, userID1=%d, userID2=%d, CreatedAt=%v",
			fixedTime, room.RoomID, room.UserID1, room.UserID2, room.CreatedAt,
		)
	}

	// モックの期待値が満たされているかチェック
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestGetRoomByUser(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	repo := NewPostgresRepository(db)

	fixedTime := time.Date(2026, 3, 14, 12, 0, 0, 0, time.UTC)

	// モックするクエリと返す値
	mock.ExpectQuery(`SELECT room_id, user_id1, user_id2, created_at FROM rooms WHERE user_id1 = \$1 OR user_id2 = \$1`).
		WithArgs(int64(1)).
		WillReturnRows(sqlmock.NewRows([]string{"room_id", "user_id1", "user_id2", "created_at"}).
			AddRow(123, 1, 2, fixedTime).
			AddRow(124, 1, 3, fixedTime).
			AddRow(125, 4, 1, fixedTime))

	ctx := context.Background()
	rooms, err := repo.GetRoomByUser(ctx, 1)
	if err != nil {
		t.Errorf("unexpected error: %s", err)
	}

	// 返り値チェック
	if len(rooms) != 3 {
		t.Fatalf("expected 3 rooms, got %d", len(rooms))
	}

	expected := []*Room{
		{RoomID: 123, UserID1: 1, UserID2: 2, CreatedAt: fixedTime},
		{RoomID: 124, UserID1: 1, UserID2: 3, CreatedAt: fixedTime},
		{RoomID: 125, UserID1: 4, UserID2: 1, CreatedAt: fixedTime},
	}

	for i, r := range rooms {
		if expected[i].RoomID != r.RoomID || expected[i].UserID1 != r.UserID1 || expected[i].UserID2 != r.UserID2 || !expected[i].CreatedAt.Equal(r.CreatedAt) {
			t.Errorf("unexpected room at index %d.\ngot:  %+v\nwant: %+v", i, r, expected[i])
		}
	}

	// モックの期待値が満たされているかチェック
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
