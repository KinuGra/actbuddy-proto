package auth

import (
	"context"

	"github.com/google/uuid"
)

// Repository は認証関連のDB操作を抽象化するインタフェース
type Repository interface {
	// ユーザー操作
	CreateUser(ctx context.Context, user *User) error
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)

	// セッション操作
	CreateSession(ctx context.Context, session *Session) error
	GetSessionByToken(ctx context.Context, token string) (*Session, error)
	DeleteSessionByToken(ctx context.Context, token string) error
	DeleteSessionByUserID(ctx context.Context, userID uuid.UUID) error
}
