package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	_ "github.com/lib/pq"

	"backend/internal/task"
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

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ok": true})
	})

	v1 := r.Group("/api/v1")
	{
		actionItems := v1.Group("/action-items")
		actionItems.GET("/:uuid", taskHandler.Get)
		actionItems.PUT("/:uuid", taskHandler.Update)
		actionItems.DELETE("/:uuid", taskHandler.Delete)
	}

	_ = r.Run("0.0.0.0:8080")
}
