// @title           ActBuddy API
// @version         1.0
// @description     ActBuddy backend API
// @host            localhost:8080
// @BasePath        /

package main

import (
	"backend/internal/auth"
	"backend/internal/buddy"
	"backend/internal/chat"
	"backend/internal/chat/websocket"
	"backend/internal/task"
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "backend/docs"

	chatmessage "backend/internal/chat/message"
	chatroom "backend/internal/chat/room"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	// DB接続
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	// *sql.DBをsqlx.DBにラップ（authで使用）
	sqlxDB := sqlx.NewDb(db, "postgres")

	// 依存関係の組み立て（DI）
	authRepo := auth.NewPostgresRepository(sqlxDB)
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)
	taskRepo := task.NewPostgresRepository(db)
	taskSvc := task.NewService(taskRepo)
	taskHandler := task.NewHandler(taskSvc)

	buddyRepo := buddy.NewPostgresRepository(db)
	buddySvc := buddy.NewService(buddyRepo)
	buddyHandler := buddy.NewHandler(buddySvc)
	buddy.StartMatchingJob(buddySvc)

	roomRepo := chatroom.NewPostgresRepository(db)
	roomSvc := chatroom.NewRoomService(roomRepo)
	msgRepo := chatmessage.NewPostgresRepository(db)
	msgSvc := chatmessage.NewMessageService(msgRepo)
	chatHandler := chat.NewHandler(roomSvc, msgSvc)

	// Ginルーター
	r := gin.Default()

	// 開発中はNext(3000)から叩くのでCORS許可
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3000" // ローカル開発用デフォルト
	}
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{corsOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/health", healthHandler)

	// 認証不要
	public := r.Group("/api/auth")
	{
		public.POST("/signup", authHandler.Signup)
		public.POST("/login", authHandler.Login)
	}

	// 認証必要
	protected := r.Group("/api")
	protected.Use(auth.AuthMiddleware(authService))
	{
		protected.POST("/auth/logout", authHandler.Logout)
		protected.GET("/auth/me", authHandler.Me)
		protected.PUT("/auth/me", authHandler.UpdateMe)

		// チャット
		protected.GET("/rooms", chatHandler.GetRooms)
		protected.GET("/rooms/:id/messages", chatHandler.GetMessages)

		// バディ
		buddyGroup := protected.Group("/buddy")
		{
			buddyGroup.GET("/profile", buddyHandler.GetProfile)
			buddyGroup.PUT("/profile", buddyHandler.UpsertProfile)
			buddyGroup.GET("/queue", buddyHandler.GetQueueStatus)
			buddyGroup.POST("/queue", buddyHandler.JoinQueue)
			buddyGroup.DELETE("/queue", buddyHandler.LeaveQueue)
			buddyGroup.GET("/relationships", buddyHandler.GetRelationships)
			buddyGroup.DELETE("/relationships/:id", buddyHandler.EndRelationship)
			buddyGroup.GET("/capacity", buddyHandler.GetCapacity)
		}

		// アクションアイテム
		actionItems := protected.Group("/v1/action-items")
		{
			actionItems.POST("", taskHandler.Create)
			actionItems.GET("", taskHandler.List)
			actionItems.GET("/:uuid", taskHandler.Get)
			actionItems.PUT("/:uuid", taskHandler.Update)
			actionItems.DELETE("/:uuid", taskHandler.Delete)
		}
	}

	hub := websocket.NewHub()
	go hub.Run()

	r.GET("/ws", func(c *gin.Context) {
		websocket.ServeWs(hub, authService, roomSvc, msgSvc, c.Writer, c.Request)
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("サーバー起動に失敗: %v", err)
	}
}

// healthHandler godoc
// @Summary      ヘルスチェック
// @Description  サーバーの死活確認
// @Tags         system
// @Produce      json
// @Success      200  {object}  map[string]bool
// @Router       /health [get]
func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
