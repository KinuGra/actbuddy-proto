package room

import (
	"context"
	"database/sql"
	"log"
	"testing"

	_ "github.com/lib/pq"
)

func setupTestDB(t *testing.T) *sql.DB {
	dsn := "postgres://postgres:postgres@localhost:5432/actbuddy?sslmode=disable"


	db, err := sql.Open("postgres", dsn)
	if err != nil {
		t.Fatalf("failed to connect db: %v", err)
	}

	// 接続確認
	if err := db.Ping(); err != nil {
		t.Fatalf("failed to ping db: %v", err)
	}

	// テーブルをクリア
	_, err = db.Exec("TRUNCATE TABLE rooms CASCADE")
	if err != nil {
			t.Fatalf("failed to truncate rooms: %v", err)
	}
	_, err = db.Exec("TRUNCATE TABLE users CASCADE")
	if err != nil {
			t.Fatalf("failed to truncate users: %v", err)
	}

	return db
}

func TestCreateRoom(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewPostgresRepository(db)
	ctx := context.Background()

	var user1ID, user2ID string
	err := db.QueryRow(`
			INSERT INTO users (email, password_hash, display_name) 
			VALUES ('alice@example.com', 'dummyhash', 'Alice') 
			RETURNING id
	`).Scan(&user1ID)
	if err != nil {
			t.Fatalf("failed to insert user1: %v", err)
	}

	err = db.QueryRow(`
			INSERT INTO users (email, password_hash, display_name) 
			VALUES ('bob@example.com', 'dummyhash', 'Bob') 
			RETURNING id
	`).Scan(&user2ID)
	if err != nil {
			t.Fatalf("failed to insert user2: %v", err)
	}
	roomID, err := repo.CreateRoom(ctx, user1ID, user2ID)
	if err != nil {
		t.Errorf("unexpected error: %s", err)
	}

	if roomID == "" {
		t.Errorf("expected non-empty roomID, got empty")
	}

	log.Printf("Created room ID: %s", roomID)
}

func TestGetRoomByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewPostgresRepository(db)
	ctx := context.Background()

	// 既存の room を作成
	var user1ID, user2ID string
	err := db.QueryRow(`
			INSERT INTO users (email, password_hash, display_name) 
			VALUES ('alice@example.com', 'dummyhash', 'Alice') 
			RETURNING id
	`).Scan(&user1ID)
	if err != nil {
			t.Fatalf("failed to insert user1: %v", err)
	}

	err = db.QueryRow(`
			INSERT INTO users (email, password_hash, display_name) 
			VALUES ('bob@example.com', 'dummyhash', 'Bob') 
			RETURNING id
	`).Scan(&user2ID)
	if err != nil {
			t.Fatalf("failed to insert user2: %v", err)
	}

	var roomID string
	err = db.QueryRow(`INSERT INTO rooms (user_id1, user_id2) VALUES ($1, $2) RETURNING room_id`, user1ID, user2ID).Scan(&roomID)
	if err != nil {
		t.Fatalf("failed to create room: %v", err)
	}

	room, err := repo.GetRoomByID(ctx, roomID)
	if err != nil {
		t.Fatalf("unexpected error: %s", err)
	}

	if room.RoomID != roomID || room.UserID1 != user1ID || room.UserID2 != user2ID {
		t.Errorf("unexpected room data: %+v", room)
	}
}

func TestGetRoomByUser(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	repo := NewPostgresRepository(db)
	ctx := context.Background()

	// ユーザーとルーム作成
	var user1ID, user2ID, user3ID string
	err := db.QueryRow(`
			INSERT INTO users (email, password_hash, display_name) 
			VALUES ('alice@example.com', 'dummyhash', 'Alice') 
			RETURNING id
	`).Scan(&user1ID)
	if err != nil {
			t.Fatalf("failed to insert user1: %v", err)
	}

	err = db.QueryRow(`
			INSERT INTO users (email, password_hash, display_name) 
			VALUES ('bob@example.com', 'dummyhash', 'Bob') 
			RETURNING id
	`).Scan(&user2ID)

	err = db.QueryRow(`
			INSERT INTO users (email, password_hash, display_name) 
			VALUES ('carol@example.com', 'dummyhash', 'Carol') 
			RETURNING id
	`).Scan(&user3ID)
	if err != nil {
			t.Fatalf("failed to insert user3: %v", err)
	}

	// 複数ルーム作成
	var roomID1, roomID2 string
	db.QueryRow(`INSERT INTO rooms (user_id1, user_id2) VALUES ($1, $2) RETURNING room_id`, user1ID, user2ID).Scan(&roomID1)
	db.QueryRow(`INSERT INTO rooms (user_id1, user_id2) VALUES ($1, $2) RETURNING room_id`, user1ID, user3ID).Scan(&roomID2)

	rooms, err := repo.GetRoomByUser(ctx, user1ID)
	if err != nil {
		t.Fatalf("unexpected error: %s", err)
	}

	if len(rooms) != 2 {
		t.Fatalf("expected 2 rooms, got %d", len(rooms))
	}

	foundIDs := map[string]bool{roomID1: false, roomID2: false}
	for _, r := range rooms {
		if _, ok := foundIDs[r.RoomID]; ok {
			foundIDs[r.RoomID] = true
		}
	}
	for id, found := range foundIDs {
		if !found {
			t.Errorf("roomID %s not found in GetRoomByUser result", id)
		}
	}
}