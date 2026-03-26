-- action_items はカレンダー機能のAction Item格納用
-- user_id は将来の認証導入まで暫定で外部キー制約を付けない（ダミーUUID送信を許容するため）

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE action_items (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    kind VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_action_items_user_id_start_time
    ON action_items (user_id, start_time);

-- updated_at 自動更新（000001 の update_updated_at() を利用）
CREATE TRIGGER trigger_action_items_updated_at
    BEFORE UPDATE ON action_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

