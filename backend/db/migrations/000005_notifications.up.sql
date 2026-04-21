-- notifications: アプリ内通知（現フェーズはポップアップのみ）
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL
               CHECK (type IN ('action_item_reminder', 'match_found', 'new_message', 'buddy_ended')),
    title      VARCHAR(255) NOT NULL,
    body       TEXT,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    metadata   JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 未読通知の取得に使う
CREATE INDEX idx_notifications_user_id_is_read
    ON notifications (user_id, is_read);

-- 通知一覧の新着順ソートに使う
CREATE INDEX idx_notifications_user_id_created_at
    ON notifications (user_id, created_at DESC);
