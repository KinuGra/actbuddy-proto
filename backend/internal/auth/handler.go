package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Signup POST /api/auth/signup
func (h *Handler) Signup(c *gin.Context) {
	// 1. リクエストをパース
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
	}

	// 2. サービス層を呼ぶ
	user, token, err := h.service.Signup(c.Request.Context(), req)
	if err != nil {
		if err == ErrEmailAlreadyExists {
			c.JSON(http.StatusConflict, gin.H{"error": "このメールアドレスは既に使用されています"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	// 3. Cookieをセット
	setSessionCookie(c, token)

	// 4. レスポンスを返す
	c.JSON(http.StatusCreated, user)
}

// Login POST /api/auth/login
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
		return
	}

	user, token, err := h.service.Login(c.Request.Context(), req)
	if err != nil {
		if err == ErrInvalidCredentials {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "メールアドレスまたはパスワードが正しくありません"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	setSessionCookie(c, token)
	c.JSON(http.StatusOK, user)
}

// Logout POST /api/auth/logout
func (h *Handler) Logout(c *gin.Context) {
	token, err := c.Cookie(SessionCookieName)
	if err != nil {
		// Cookie がなくてもログアウト成功として返す
		c.JSON(http.StatusOK, gin.H{"message": "ログアウトしました"})
		return
	}

	if err := h.service.Logout(c.Request.Context(), token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	clearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "ログアウトしました"})
}

// Me GET /api/auth/me
func (h *Handler) Me(c *gin.Context) {
	user, ok := GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// setSessionCookie はレスポンスにセッションCookieをセットする
func setSessionCookie(c *gin.Context, token string) {
	c.SetCookie(
		SessionCookieName,
		token,
		int(24*time.Hour.Seconds()), // 24時間
		"/",
		"",    // domain（本番では設定）
		false, // secure（本番ではtrue）
		true,  // httpOnly
	)
}

// clearSessionCookie はセッションCookieを削除する
func clearSessionCookie(c *gin.Context) {
	c.SetCookie(
		SessionCookieName,
		"",
		-1,
		"/",
		"",
		false,
		true,
	)
}
