package task

import (
	"errors"
	"net/http"

	"backend/internal/auth"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// Create godoc
// @Summary      アクションアイテム作成
// @Description  新しいアクションアイテムを作成する
// @Tags         action-items
// @Accept       json
// @Produce      json
// @Param        body  body      CreateRequest  true  "アクションアイテム情報"
// @Success      201   {object}  map[string]ActionItemResponse
// @Failure      400   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /api/v1/action-items [post]
func (h *Handler) Create(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// セッションユーザーIDで上書き（クライアント送信値を無視）
	req.UserID = user.ID.String()

	item, err := h.svc.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": toResponse(item)})
}

// List godoc
// @Summary      アクションアイテム一覧取得
// @Description  指定ユーザーのアクションアイテム一覧を取得する
// @Tags         action-items
// @Produce      json
// @Param        user_id  query     string  true  "ユーザーUUID"
// @Success      200      {object}  map[string][]ActionItemResponse
// @Failure      400      {object}  map[string]string
// @Failure      500      {object}  map[string]string
// @Router       /api/v1/action-items [get]
func (h *Handler) List(c *gin.Context) {
	user, ok := auth.GetCurrentUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var items []*ActionItem
	var err error

	targetParam := c.Query("target_user_id")
	if targetParam != "" {
		targetID, parseErr := uuid.Parse(targetParam)
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid target_user_id"})
			return
		}
		items, err = h.svc.ListForUser(c.Request.Context(), user.ID, targetID)
	} else {
		items, err = h.svc.ListByUserID(c.Request.Context(), user.ID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res := make([]*ActionItemResponse, len(items))
	for i, item := range items {
		res[i] = toResponse(item)
	}
	c.JSON(http.StatusOK, gin.H{"data": res})
}

// Get godoc
// @Summary      アクションアイテム取得
// @Description  UUIDでアクションアイテムを1件取得する
// @Tags         action-items
// @Produce      json
// @Param        uuid  path      string  true  "アクションアイテムUUID"
// @Success      200   {object}  map[string]ActionItemResponse
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /api/v1/action-items/{uuid} [get]
func (h *Handler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid uuid"})
		return
	}

	item, err := h.svc.GetByUUID(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": toResponse(item)})
}

// Update godoc
// @Summary      アクションアイテム更新
// @Description  UUIDでアクションアイテムを部分更新する
// @Tags         action-items
// @Accept       json
// @Produce      json
// @Param        uuid  path      string         true  "アクションアイテムUUID"
// @Param        body  body      UpdateRequest  true  "更新内容"
// @Success      200   {object}  map[string]ActionItemResponse
// @Failure      400   {object}  map[string]string
// @Failure      404   {object}  map[string]string
// @Failure      500   {object}  map[string]string
// @Router       /api/v1/action-items/{uuid} [put]
func (h *Handler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid uuid"})
		return
	}

	var req UpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item, err := h.svc.Update(c.Request.Context(), id, &req)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": toResponse(item)})
}

// Delete godoc
// @Summary      アクションアイテム削除
// @Description  UUIDでアクションアイテムを削除する
// @Tags         action-items
// @Produce      json
// @Param        uuid  path  string  true  "アクションアイテムUUID"
// @Success      204
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /api/v1/action-items/{uuid} [delete]
func (h *Handler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid uuid"})
		return
	}

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		if errors.Is(err, ErrNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
