package chat

import (
	"net/http"

	"backend/internal/auth"
	"backend/internal/chat/message"
	"backend/internal/chat/room"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	roomSvc *room.RoomService
	msgSvc  *message.MessageService
}

func NewHandler(roomSvc *room.RoomService, msgSvc *message.MessageService) *Handler {
	return &Handler{roomSvc: roomSvc, msgSvc: msgSvc}
}

// GetRooms GET /api/rooms
func (h *Handler) GetRooms(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	rooms, err := h.roomSvc.GetRoomsByUserID(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	type partnerInfo struct {
		ID          string `json:"id"`
		DisplayName string `json:"display_name"`
	}
	type roomResponse struct {
		ID          string      `json:"id"`
		Partner     partnerInfo `json:"partner"`
		CreatedAt   interface{} `json:"created_at"`
		UnreadCount int         `json:"unread_count"`
	}

	res := make([]roomResponse, 0, len(rooms))
	for _, r := range rooms {
		res = append(res, roomResponse{
			ID: r.ID.String(),
			Partner: partnerInfo{
				ID:          r.PartnerID.String(),
				DisplayName: r.PartnerName,
			},
			CreatedAt:   r.CreatedAt,
			UnreadCount: r.UnreadCount,
		})
	}
	c.JSON(http.StatusOK, res)
}

// MarkRoomAsRead PUT /api/rooms/:id/read
func (h *Handler) MarkRoomAsRead(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	roomID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不正なID形式です"})
		return
	}

	isMember, err := h.roomSvc.IsRoomMember(c.Request.Context(), roomID, user.ID)
	if err != nil || !isMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "アクセス権がありません"})
		return
	}

	if err := h.roomSvc.UpdateLastRead(c.Request.Context(), roomID, user.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// GetMessages GET /api/rooms/:id/messages
func (h *Handler) GetMessages(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	roomID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不正なID形式です"})
		return
	}

	// ルームメンバーシップ確認
	isMember, err := h.roomSvc.IsRoomMember(c.Request.Context(), roomID, user.ID)
	if err != nil || !isMember {
		c.JSON(http.StatusForbidden, gin.H{"error": "アクセス権がありません"})
		return
	}

	msgs, err := h.msgSvc.GetMessagesByRoomID(c.Request.Context(), roomID, 100)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	type msgResponse struct {
		ID         int64       `json:"id"`
		RoomID     string      `json:"room_id"`
		SenderID   string      `json:"sender_id"`
		SenderName string      `json:"sender_name"`
		Content    string      `json:"content"`
		CreatedAt  interface{} `json:"created_at"`
	}

	res := make([]msgResponse, 0, len(msgs))
	for _, m := range msgs {
		res = append(res, msgResponse{
			ID:         m.ID,
			RoomID:     m.RoomID.String(),
			SenderID:   m.SenderID.String(),
			SenderName: m.SenderName,
			Content:    m.Content,
			CreatedAt:  m.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, res)
}
