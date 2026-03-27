package room

import (
	"context"
)

type RoomService struct {
	repo RoomRepository
}

type RoomResponse struct {
    ID              string `json:"id"`
    ParticipantID   string `json:"participant_id"`
}

func NewService(repo RoomRepository) *RoomService {
	return &RoomService{repo: repo}
}

func (s *RoomService) CreateRoom(ctx context.Context, userID1, userID2 string) (string, error) {
	return s.repo.CreateRoom(ctx, userID1, userID2)
}

func (s *RoomService) GetRoomByID(ctx context.Context, roomID string) (*Room, error) {
	return s.repo.GetRoomByID(ctx, roomID)
}

func (s *RoomService) GetRoomByUser(ctx context.Context, userID string) ([]*RoomResponse, error) {
    rooms, err := s.repo.GetRoomByUser(ctx, userID)
    if err != nil {
        return nil, err
    }

    var res []*RoomResponse

    for _, r := range rooms {
        // 自分以外のuserIDを取得
        var otherUserID string
        if r.UserID1 == userID {
            otherUserID = r.UserID2
        } else {
            otherUserID = r.UserID1
        }

        res = append(res, &RoomResponse{
            ID:              r.RoomID,
            ParticipantID:   otherUserID,
        })
    }

    return res, nil
}
