package task

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var ErrNotFound = errors.New("action item not found")

type Service interface {
	Create(ctx context.Context, req *CreateRequest) (*ActionItem, error)
	GetByUUID(ctx context.Context, id uuid.UUID) (*ActionItem, error)
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*ActionItem, error)
	Update(ctx context.Context, id uuid.UUID, req *UpdateRequest) (*ActionItem, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Create(ctx context.Context, req *CreateRequest) (*ActionItem, error) {
	item := &ActionItem{
		UserID:      req.UserID,
		Title:       req.Title,
		Description: req.Description,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Kind:        req.Kind,
		Status:      req.Status,
	}
	return s.repo.Create(ctx, item)
}

func (s *service) GetByUUID(ctx context.Context, id uuid.UUID) (*ActionItem, error) {
	return s.repo.FindByUUID(ctx, id)
}

func (s *service) ListByUserID(ctx context.Context, userID uuid.UUID) ([]*ActionItem, error) {
	return s.repo.FindByUserID(ctx, userID)
}

func (s *service) Update(ctx context.Context, id uuid.UUID, req *UpdateRequest) (*ActionItem, error) {
	item, err := s.repo.FindByUUID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		item.Title = *req.Title
	}
	if req.Description != nil {
		item.Description = *req.Description
	}
	if req.StartTime != nil {
		item.StartTime = *req.StartTime
	}
	if req.EndTime != nil {
		item.EndTime = *req.EndTime
	}
	if req.Kind != nil {
		item.Kind = *req.Kind
	}
	if req.Status != nil {
		item.Status = *req.Status
	}

	return s.repo.Update(ctx, item)
}

func (s *service) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
