-- rooms: チャットルーム
-- buddy_relationship_id が NULL の場合はフレンド間のルーム
CREATE TABLE rooms (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buddy_relationship_id UUID REFERENCES buddy_relationships(id) ON DELETE SET NULL,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- room_members: ルームの参加者
CREATE TABLE room_members (
    room_id   UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

CREATE INDEX idx_room_members_user_id ON room_members (user_id);

-- messages: チャットメッセージ
CREATE TABLE messages (
    id         BIGSERIAL PRIMARY KEY,
    room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_room_id_created_at
    ON messages (room_id, created_at DESC);
