// @title           ActBuddy API
// @version         1.0
// @description     ActBuddy backend API
// @host            localhost:8080
// @BasePath        /

package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "backend/docs"

	"backend/internal/auth"
	"backend/internal/chat/websocket"
	"backend/internal/task"

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

	// Ginルーター
	r := gin.Default()

	// 開発中はNext(3000)から叩くのでCORS許可
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
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
	}

	hub := websocket.NewHub()
	go hub.Run()

	r.GET("/ws", func(c *gin.Context) {
		websocket.ServeWs(hub, c.Writer, c.Request)
	})

	v1 := r.Group("/api/v1")
	{
		actionItems := v1.Group("/action-items")
		actionItems.POST("", taskHandler.Create)
		actionItems.GET("", taskHandler.List)
		actionItems.GET("/:uuid", taskHandler.Get)
		actionItems.PUT("/:uuid", taskHandler.Update)
		actionItems.DELETE("/:uuid", taskHandler.Delete)
	}

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	_ = r.Run("0.0.0.0:8080")
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
