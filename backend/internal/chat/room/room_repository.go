package room

import (
	"context"

	"github.com/google/uuid"
)

type RoomRepository interface {
	// ユーザーが参加しているルーム一覧（パートナー情報付き）
	GetRoomsByUserID(ctx context.Context, userID uuid.UUID) ([]*RoomWithPartner, error)
	// WebSocket接続時のルームID一覧取得
	GetUserRoomIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
	// ユーザーがルームメンバーかチェック
	IsRoomMember(ctx context.Context, roomID, userID uuid.UUID) (bool, error)
	// 最終既読メッセージIDを更新
	UpdateLastRead(ctx context.Context, roomID, userID uuid.UUID) error
}
