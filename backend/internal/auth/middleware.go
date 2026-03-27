package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	// Cookie名
	SessionCookieName = "session_token"
	// Gin Contextに保存するキー
	ContextKeyUser = "currentUser"
)

// AuthMiddleware はセッションベースの認証ミドルウェア
func AuthMiddleware(service *Service) gin.HandlerFunc { // gin.HandlerFuncにGinがcを自動で渡す
	return func(c *gin.Context) {
		// 1. Cookieからセッショントークンを取得
		token, err := c.Cookie(SessionCookieName)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "認証が必要です",
			})
			return
		}

		// 2. トークンでセッションを検証し、ユーザー情報を取得
		user, err := service.GetCurrentUser(c.Request.Context(), token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "無効または期限切れのセッションです",
			})
			return
		}

		// 3. Gin Contextにユーザー情報をセット
		c.Set(ContextKeyUser, user)

		// 4. 次のハンドラーへ
		c.Next()
	}
}

// GetCurrentUserFromContext はGin Contextからユーザー情報を取得するヘルパー
func GetCurrentUserFromContext(c *gin.Context) (*UserResponse, bool) {
	value, exists := c.Get(ContextKeyUser)
	if !exists {
		return nil, false
	}

	user, ok := value.(*UserResponse)
	if !ok {
		return nil, false
	}

	return user, true
}
