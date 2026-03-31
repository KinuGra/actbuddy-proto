package auth

import (
	"time"

	"github.com/google/uuid"
)

// DBのテーブルに対応する構造体
// db:"email" DB→Goの構造体マッピング

// Userはusersテーブルに対応する構造体
type User struct {
	ID           uuid.UUID `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"` // - はJSONに含めないという意味
	DisplayName  string    `db:"display_name" json:"display_name"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

// Sessionはsessionsテーブルに対応する構造体
type Session struct {
	ID        uuid.UUID `db:"id"`
	UserID    uuid.UUID `db:"user_id"`
	Token     string    `db:"token"`
	ExpiresAt time.Time `db:"expires_at"`
	CreatedAt time.Time `db:"created_at"`
}

// APIリクエスト用の構造体

// SignupRequestはサインアップ時にクライアントから受け取るJSON
type SignupRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
	DisplayName string `json:"display_name" binding:"required"`
}

// LoginRequest はログイン時にクライアントから受け取るJSON
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// APIレスポンス用の構造体

// UserResponseはクライアントに返すユーザー情報
// パスワードハッシュなどの機密情報は含まない
type UserResponse struct {
	ID          uuid.UUID `json:"id"`
	Email       string    `json:"email"`
	DisplayName string    `json:"display_name"`
	CreatedAt   time.Time `json:"created_at"`
}

// AuthResponseはログイン・サインアップ時にクライアントに返すレスポンス
type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}
