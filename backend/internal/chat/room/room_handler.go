package room

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type RoomHandler struct {
	service *RoomService
}

func NewHandler(s *RoomService) *RoomHandler {
	return &RoomHandler{service: s}
}

// ユーザーのルーム一覧
func (h *RoomHandler) GetRoomsByUser(c *gin.Context) {
	userID := c.Param("user_id")

	rooms, err := h.service.GetRoomByUser(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, rooms)
}

// ルーム取得
func (h *RoomHandler) GetRoomByID(c *gin.Context) {
	roomID := c.Param("room_id")

	room, err := h.service.GetRoomByID(c, roomID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}

// ルーム作成
func (h *RoomHandler) CreateRoom(c *gin.Context) {
	var req struct {
		UserID1 string `json:"userId1"`
		UserID2 string `json:"userId2"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roomID, err := h.service.CreateRoom(c, req.UserID1, req.UserID2)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"roomId": roomID})
}