package room

import (
	"time"

	"github.com/google/uuid"
)

type Room struct {
	ID                  uuid.UUID  `db:"id"`
	BuddyRelationshipID *uuid.UUID `db:"buddy_relationship_id"`
	CreatedAt           time.Time  `db:"created_at"`
}

// RoomWithPartner はルーム一覧API用（パートナー情報付き）
type RoomWithPartner struct {
	ID            uuid.UUID `db:"id"`
	PartnerID     uuid.UUID `db:"partner_id"`
	PartnerName   string    `db:"partner_name"`
	CreatedAt     time.Time `db:"created_at"`
}
