// @title           ActBuddy API
// @version         1.0
// @description     ActBuddy backend API
// @host            localhost:8080
// @BasePath        /

package main

import (
	_ "backend/docs"
	"database/sql"
	"log"
	"net/http"
	"os"

	"backend/internal/chat/websocket"
	"backend/internal/chat/room"
	"backend/internal/task"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	taskRepo := task.NewPostgresRepository(db)
	taskSvc := task.NewService(taskRepo)
	taskHandler := task.NewHandler(taskSvc)

	r := gin.Default()

	// 開発中はNext(3000)から叩くのでCORS許可
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	r.GET("/health", healthHandler)

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

	// roomのバックエンド
	roomRepo := room.NewPostgresRepository(db)
	roomService := room.NewService(roomRepo)
	roomHandler := room.NewHandler(roomService)

	rooms := v1.Group("/rooms")
	{
		rooms.GET("/user/:user_id", roomHandler.GetRoomsByUser) // 指定ユーザーのルーム一覧取得
		rooms.GET("/room/:room_id", roomHandler.GetRoomByID) // 指定ユーザーのルーム一覧取得
		rooms.POST("", roomHandler.CreateRoom)           // ルーム作成
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
