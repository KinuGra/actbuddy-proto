package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// サービス層のエラー定義
var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailAlreadyExists = errors.New("email already exists")
)

// Serviceは認証に関するビジネスロジックを持つ
type Service struct {
	repo            Repository
	sessionDuration time.Duration // セッションの有効期限
}

// NewService はServiceを生成するコンストラクタ
func NewService(repo Repository) *Service {
	return &Service{
		repo:            repo,
		sessionDuration: 7 * 24 * time.Hour, // デフォルト：7日間
	}
}

// サインアップ

func (s *Service) Signup(ctx context.Context, req SignupRequest) (*UserResponse, string, error) {
	// 1. メールの重複チェック
	_, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err == nil {
		// ユーザーが見つかった = 既に存在する
		return nil, "", ErrEmailAlreadyExists
	}
	if !errors.Is(err, ErrUserNotFound) {
		// ErrUserNotFound 以外のエラー = DB障害等
		return nil, "", err
	}

	// 2. パスワードをハッシュ化
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	// 3. ユーザーを作成
	user := &User{
		ID:           uuid.New(),
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		DisplayName:  req.DisplayName,
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		if errors.Is(err, ErrDuplicateEmail) {
			return nil, "", ErrEmailAlreadyExists
		}
		return nil, "", err
	}

	// 4. セッションを作成
	token, err := s.createSession(ctx, user.ID)
	if err != nil {
		return nil, "", err
	}

	// 5. レスポンスを返す
	return toUserResponse(user), token, nil
}

// ログイン

func (s *Service) Login(ctx context.Context, req LoginRequest) (*UserResponse, string, error) {
	// 1. メールでユーザーを検索
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return nil, "", ErrInvalidCredentials
		}
		return nil, "", err
	}

	// 2. パスワードを照合
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}

	// 3. セッション作成
	token, err := s.createSession(ctx, user.ID)
	if err != nil {
		return nil, "", err
	}

	// 4. レスポンスを返す
	return toUserResponse(user), token, nil
}

func (s *Service) Logout(ctx context.Context, token string) error {
	return s.repo.DeleteSessionByToken(ctx, token)
}

// ユーザー情報更新

func (s *Service) UpdateMe(ctx context.Context, userID uuid.UUID, req UpdateMeRequest) (*UserResponse, error) {
	// 1. ユーザーを取得
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 2. メールアドレスが変更される場合、重複チェック
	if req.Email != user.Email {
		_, err := s.repo.GetUserByEmail(ctx, req.Email)
		if err == nil {
			return nil, ErrEmailAlreadyExists
		}
		if !errors.Is(err, ErrUserNotFound) {
			return nil, err
		}
	}

	// 3. フィールドを更新
	user.Email = req.Email
	user.DisplayName = req.DisplayName

	// 4. DB保存
	if err := s.repo.UpdateUser(ctx, user); err != nil {
		if errors.Is(err, ErrDuplicateEmail) {
			return nil, ErrEmailAlreadyExists
		}
		return nil, err
	}

	return toUserResponse(user), nil
}

// 現在のユーザー情報

func (s *Service) GetCurrentUser(ctx context.Context, token string) (*UserResponse, error) {
	// 1. トークンでセッションを検索
	session, err := s.repo.GetSessionByToken(ctx, token)
	if err != nil {
		return nil, err
	}

	// 2. ユーザー情報を取得
	user, err := s.repo.GetUserByID(ctx, session.UserID)
	if err != nil {
		return nil, err
	}

	return toUserResponse(user), nil
}

// ヘルパー

// createSession はセッショントークンを生成してDBに保存する
func (s *Service) createSession(ctx context.Context, userID uuid.UUID) (string, error) {
	// crypto/rand で安全なランダムトークンを生成
	token, err := generateToken(32)
	if err != nil {
		return "", err
	}

	session := &Session{
		ID:        uuid.New(),
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(s.sessionDuration),
	}

	if err := s.repo.CreateSession(ctx, session); err != nil {
		return "", err
	}

	return token, nil
}

// generateToken は暗号学的に安全なランダムトークンを生成する
func generateToken(bytes int) (string, error) {
	b := make([]byte, bytes)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	// バイト列のままでは文字列として扱えない値が含まれるので、32バイト->64文字の16進数文字列
	return hex.EncodeToString(b), nil
}

// toUserResponse はUserからパスワードハッシュを除いたレスポンスに変換する
func toUserResponse(user *User) *UserResponse {
	return &UserResponse{
		ID:          user.ID,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		CreatedAt:   user.CreatedAt,
	}
}
