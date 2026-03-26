package auth

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// よく使うエラーを定義
var (
	ErrUserNotFound    = errors.New("user not found")
	ErrSessionNotFound = errors.New("session not found")
	ErrDuplicateEmail  = errors.New("email already exists")
)

// PostgresRepository はRepositoryインターフェースのPostgreSQL実装
type PostgresRepository struct {
	db *sqlx.DB
}

// NewPostgresRepository はPostgresRepositoryを生成するコンストラクタ
func NewPostgresRepository(db *sqlx.DB) *PostgresRepository {
	return &PostgresRepository{db: db}
}

// ユーザー操作
// ctxを渡すことでどこでもキャンセル、タイムアウトが可能になる
func (r *PostgresRepository) CreateUser(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (id, email, password_hash, display_name)
		VALUES (:id, :email, :password_hash, :display_name)
	`

	_, err := r.db.NamedExecContext(ctx, query, user)
	if err != nil {
		// PostgreSQLのユニーク制約違反コード: 23505
		if isUniqueViolation(err) {
			return ErrDuplicateEmail
		}
		return err
	}
	return nil
}

func (r *PostgresRepository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	var user User
	query := `SELECT * FROM users WHERE email = $1`

	err := r.db.GetContext(ctx, &user, query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *PostgresRepository) GetUserByID(ctx context.Context, id uuid.UUID) (*User, error) {
	var user User
	query := `SELECT * FROM users WHERE id = $1`

	err := r.db.GetContext(ctx, &user, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *PostgresRepository) CreateSession(ctx context.Context, session *Session) error {
	query := `
		INSERT INTO sessions (id, user_id, token, expires_at)
		VALUES (:id, :user_id, :token, :expires_at)
	`

	_, err := r.db.NamedExecContext(ctx, query, session)
	return err
}

func (r *PostgresRepository) GetSessionByToken(ctx context.Context, token string) (*Session, error) {
	var session Session
	query := `SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()`

	err := r.db.GetContext(ctx, &session, query, token)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrSessionNotFound
		}
		return nil, err
	}
	return &session, nil
}

func (r *PostgresRepository) DeleteSessionByToken(ctx context.Context, token string) error {
	query := `DELETE FROM sessions WHERE token = $1`

	result, err := r.db.ExecContext(ctx, query, token)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrSessionNotFound
	}
	return nil
}

// userIDに紐づく全端末のセッションを削除
func (r *PostgresRepository) DeleteSessionByUserID(ctx context.Context, userID uuid.UUID) error {
	query := `DELETE FROM sessions WHERE user_id = $1`

	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}

// ヘルパー
func isUniqueViolation(err error) bool {
	return err != nil && strings.Contains(err.Error(), "23505")
}
