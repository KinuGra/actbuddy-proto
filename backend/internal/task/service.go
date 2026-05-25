package task

import (
	"context"
	"errors"

	"github.com/google/uuid"
)

var ErrNotFound = errors.New("action item not found")
var ErrForbidden = errors.New("forbidden")

// PartnerChecker はバディ関係を確認するための最小インターフェース
type PartnerChecker interface {
	IsActivePartner(ctx context.Context, userID1, userID2 uuid.UUID) (bool, error)
}

type Service interface {
	Create(ctx context.Context, req *CreateRequest) (*ActionItem, error)
	GetByUUID(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) (*ActionItem, error)
	ListByUserID(ctx context.Context, userID uuid.UUID) ([]*ActionItem, error)
	ListForUser(ctx context.Context, requesterID uuid.UUID, targetUserID uuid.UUID) ([]*ActionItem, error)
	Update(ctx context.Context, id uuid.UUID, req *UpdateRequest, requesterID uuid.UUID) (*ActionItem, error)
	Delete(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) error
}

type service struct {
	repo     Repository
	partners PartnerChecker
}

func NewService(repo Repository, partners PartnerChecker) Service {
	return &service{repo: repo, partners: partners}
}

func (s *service) Create(ctx context.Context, req *CreateRequest) (*ActionItem, error) {
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		return nil, err
	}
	item := &ActionItem{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Kind:        req.Kind,
		Status:      req.Status,
	}
	return s.repo.Create(ctx, item)
}

func (s *service) GetByUUID(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) (*ActionItem, error) {
	item, err := s.repo.FindByUUID(ctx, id)
	if err != nil {
		return nil, err
	}
	if item.UserID == requesterID {
		return item, nil
	}
	isPartner, err := s.partners.IsActivePartner(ctx, item.UserID, requesterID)
	if err != nil {
		return nil, err
	}
	if !isPartner {
		return nil, ErrForbidden
	}
	return item, nil
}

func (s *service) ListByUserID(ctx context.Context, userID uuid.UUID) ([]*ActionItem, error) {
	return s.repo.FindByUserID(ctx, userID)
}

func (s *service) ListForUser(ctx context.Context, requesterID uuid.UUID, targetUserID uuid.UUID) ([]*ActionItem, error) {
	return s.repo.FindByUserIDAsPartner(ctx, requesterID, targetUserID)
}

func (s *service) Update(ctx context.Context, id uuid.UUID, req *UpdateRequest, requesterID uuid.UUID) (*ActionItem, error) {
	item, err := s.repo.FindByUUID(ctx, id)
	if err != nil {
		return nil, err
	}
	if item.UserID != requesterID {
		return nil, ErrForbidden
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

func (s *service) Delete(ctx context.Context, id uuid.UUID, requesterID uuid.UUID) error {
	item, err := s.repo.FindByUUID(ctx, id)
	if err != nil {
		return err
	}
	if item.UserID != requesterID {
		return ErrForbidden
	}
	return s.repo.Delete(ctx, id)
}
