package buddy

import (
	"errors"
	"net/http"

	"backend/internal/auth"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GetProfile GET /api/buddy/profile
func (h *Handler) GetProfile(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	profile, err := h.service.GetProfile(c.Request.Context(), user.ID)
	if err != nil {
		if errors.Is(err, ErrProfileNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "プロフィールが見つかりません"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpsertProfile PUT /api/buddy/profile
func (h *Handler) UpsertProfile(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	var req UpsertProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "リクエストが不正です"})
		return
	}

	profile, err := h.service.UpsertProfile(c.Request.Context(), user.ID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// GetQueueStatus GET /api/buddy/queue
func (h *Handler) GetQueueStatus(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	status, err := h.service.GetQueueStatus(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	c.JSON(http.StatusOK, status)
}

// JoinQueue POST /api/buddy/queue
func (h *Handler) JoinQueue(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	q, err := h.service.JoinQueue(c.Request.Context(), user.ID)
	if err != nil {
		switch {
		case errors.Is(err, ErrProfileRequired):
			c.JSON(http.StatusBadRequest, gin.H{"error": "マッチングに参加するにはプロフィールを設定してください"})
		case errors.Is(err, ErrBuddyCapacityFull):
			c.JSON(http.StatusBadRequest, gin.H{"error": "バディの上限数に達しています"})
		case errors.Is(err, ErrAlreadyInQueue):
			c.JSON(http.StatusConflict, gin.H{"error": "すでにマッチングキューに参加しています"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":     q.Status,
		"joined_at":  q.JoinedAt,
		"expires_at": q.ExpiresAt,
	})
}

// LeaveQueue DELETE /api/buddy/queue
func (h *Handler) LeaveQueue(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	if err := h.service.LeaveQueue(c.Request.Context(), user.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "マッチングキューから退出しました"})
}

// GetRelationships GET /api/buddy/relationships
func (h *Handler) GetRelationships(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	rels, err := h.service.GetRelationships(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	c.JSON(http.StatusOK, rels)
}

// EndRelationship DELETE /api/buddy/relationships/:id
func (h *Handler) EndRelationship(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	relationshipID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不正なID形式です"})
		return
	}

	if err := h.service.EndRelationship(c.Request.Context(), user.ID, relationshipID); err != nil {
		switch {
		case errors.Is(err, ErrRelationshipNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "バディ関係が見つかりません"})
		case errors.Is(err, ErrNotRelationshipMember):
			c.JSON(http.StatusForbidden, gin.H{"error": "この操作を行う権限がありません"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "バディ関係を終了しました"})
}

// GetCapacity GET /api/buddy/capacity
func (h *Handler) GetCapacity(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	capacity, err := h.service.GetBuddyCapacity(c.Request.Context(), user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "サーバーエラーが発生しました"})
		return
	}

	c.JSON(http.StatusOK, capacity)
}
