-- action_items に user_id の外部キー制約を追加
ALTER TABLE action_items
    ADD CONSTRAINT fk_action_items_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- buddy_profiles: マッチング条件の設定（ユーザーごとに1レコード）
CREATE TABLE buddy_profiles (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio          TEXT,
    goal_types   TEXT[] NOT NULL DEFAULT '{}',
    active_times TEXT[] NOT NULL DEFAULT '{}',
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_buddy_profiles_updated_at
    BEFORE UPDATE ON buddy_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- matching_queue: バディを探しているユーザーの待機列
CREATE TABLE matching_queue (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL DEFAULT 'waiting'
               CHECK (status IN ('waiting', 'matched', 'cancelled')),
    joined_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);

-- buddy_relationships: マッチング成立したバディペア（1週間限定）
-- user_id_1 < user_id_2 の制約で同一ペアの重複を防ぐ
CREATE TABLE buddy_relationships (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'ended')),
    matched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ends_at    TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    ended_at   TIMESTAMP,
    UNIQUE (user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_buddy_relationships_user1
    ON buddy_relationships (user_id_1);
CREATE INDEX idx_buddy_relationships_user2
    ON buddy_relationships (user_id_2);
CREATE INDEX idx_buddy_relationships_ends_at
    ON buddy_relationships (ends_at)
    WHERE status = 'active';

-- friend_relationships: バディ期間終了後に成立する長期的な関係
CREATE TABLE friend_relationships (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buddy_relationship_id UUID REFERENCES buddy_relationships(id) ON DELETE SET NULL,
    created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_friend_relationships_user1
    ON friend_relationships (user_id_1);
CREATE INDEX idx_friend_relationships_user2
    ON friend_relationships (user_id_2);
