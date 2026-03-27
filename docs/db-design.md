# DB設計

## 概要

ActBuddy のデータベース設計。PostgreSQL を使用。

- UUID を主キーに統一（チャット系の既存実装は int64 だが UUID に移行する）
- 外部キー制約で参照整合性を担保
- `updated_at` は DB トリガーで自動更新（`update_updated_at()` 関数を 000001 で定義済み）

---

## Migration 構成

| ファイル | 内容 |
|---|---|
| `000001_create_users` | users, sessions ✅ 適用済み |
| `000002_create_action_items` | action_items（user_id FK なし・仮） ✅ 適用済み |
| `000003_buddy` | action_items に FK 追加、buddy_profiles, matching_queue, buddy_relationships, friend_relationships |
| `000004_chat` | rooms, room_members, messages（int64 実装を UUID に整合） |
| `000005_notifications` | notifications |

---

## ER 図

```
users
  │
  ├── sessions (1:N)
  │
  ├── action_items (1:N)
  │
  ├── buddy_profiles (1:1)
  │
  ├── matching_queue (1:0..1)
  │
  ├── buddy_relationships ─────────────────────┐
  │     user_id_1 → users                      │
  │     user_id_2 → users                      │
  │         │                                  │
  │         ├── friend_relationships (0..1)     │
  │         │                                  │
  │         └── rooms (0..1) ◄─────────────────┘
  │                 │
  │                 ├── room_members → users
  │                 └── messages → users (sender)
  │
  └── notifications (1:N)
```

---

## テーブル定義

### users（既存）

```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### sessions（既存）

```sql
CREATE TABLE sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### action_items（既存 + 000003 で FK 追加）

```sql
-- 000003 で追加
ALTER TABLE action_items
    ADD CONSTRAINT fk_action_items_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

**kind の値（フロントで定義・バックエンドは VARCHAR のまま）**

| kind | 意味 |
|---|---|
| `work` | 仕事 |
| `study` | 勉強 |
| `exercise` | 運動 |
| `creative` | 創作 |
| `other` | その他 |
| `break` | 休憩（カレンダーで色を変えて表示、チェック不要） |

**status の値**

| status | 表示名 | 意味 |
|---|---|---|
| `not_started` | 未着手 | デフォルト |
| `progress_30` | あまりできなかった | 少しは手をつけた |
| `progress_70` | だいぶできた | 十分頑張った |
| `completed` | 完了！ | やり切った |

> `break` の kind は status チェック不要。フロントで制御する。

---

### buddy_profiles（000003）

マッチングの条件。ユーザーごとに 1 レコード。

```sql
CREATE TABLE buddy_profiles (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio          TEXT,
    goal_types   TEXT[] NOT NULL DEFAULT '{}',
    -- 例: '{勉強,運動,仕事,創作,語学,資格,その他}'
    active_times TEXT[] NOT NULL DEFAULT '{}',
    -- 例: '{morning,afternoon,evening,night}'
    -- morning: 6-12時 / afternoon: 12-18時 / evening: 18-22時 / night: 22-6時
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_buddy_profiles_updated_at
    BEFORE UPDATE ON buddy_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### matching_queue（000003）

バディを探しているユーザーの待機列。

```sql
CREATE TABLE matching_queue (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL DEFAULT 'waiting'
               CHECK (status IN ('waiting', 'matched', 'cancelled')),
    joined_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);
```

| status | 意味 |
|---|---|
| `waiting` | マッチング待ち |
| `matched` | マッチング成立（自動で更新） |
| `cancelled` | 自分でキャンセル or 期限切れ |

---

### buddy_relationships（000003）

成立したバディペア。期間は1週間。

```sql
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

CREATE INDEX idx_buddy_relationships_user1 ON buddy_relationships (user_id_1);
CREATE INDEX idx_buddy_relationships_user2 ON buddy_relationships (user_id_2);
CREATE INDEX idx_buddy_relationships_ends_at ON buddy_relationships (ends_at)
    WHERE status = 'active';
```

> `ends_at` を過ぎたらバッチで `status = 'ended'` に更新し、両ユーザーにフレンド申請通知を送る。

**バディ同時人数の上限（コードで計算する）**

直近7日間の達成率（`progress_70` 以上 or `completed` の Action Item 数 ÷ 全 Action Item 数）で決まる。
DB には保持せず、API レスポンス時に都度計算する。

| 達成率 | 上限 |
|---|---|
| 〜 39% | 1人 |
| 40〜69% | 2人 |
| 70%〜 | 3人 |

---

### friend_relationships（000003）

バディ期間終了後に申請・承認で成立する長期的な関係。

```sql
CREATE TABLE friend_relationships (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_id_2              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buddy_relationship_id  UUID REFERENCES buddy_relationships(id) ON DELETE SET NULL,
    -- どのバディ期間から友達になったか（任意）
    created_at             TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_friend_relationships_user1 ON friend_relationships (user_id_1);
CREATE INDEX idx_friend_relationships_user2 ON friend_relationships (user_id_2);
```

---

### rooms（000004）

チャットルーム。バディペアに紐付けることが多い。

```sql
CREATE TABLE rooms (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buddy_relationship_id UUID REFERENCES buddy_relationships(id) ON DELETE SET NULL,
    -- NULLはフレンド間のチャットルーム
    created_at            TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### room_members（000004）

ルームの参加者（現状は常に2人）。

```sql
CREATE TABLE room_members (
    room_id   UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

CREATE INDEX idx_room_members_user_id ON room_members (user_id);
```

---

### messages（000004）

チャットメッセージ。

```sql
CREATE TABLE messages (
    id         BIGSERIAL PRIMARY KEY,
    room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_room_id_created_at ON messages (room_id, created_at DESC);
```

---

### notifications（000005）

アプリ内通知。ポップアップで表示。

```sql
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL
               CHECK (type IN ('action_item_reminder', 'match_found', 'new_message')),
    title      VARCHAR(255) NOT NULL,
    body       TEXT,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    metadata   JSONB,
    -- action_item_reminder : { "date": "2026-03-28" }
    -- match_found          : { "buddy_id": "uuid", "room_id": "uuid", "buddy_name": "名前" }
    -- new_message          : { "room_id": "uuid", "sender_name": "名前" }
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id_is_read
    ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_user_id_created_at
    ON notifications (user_id, created_at DESC);
```

---

## 既存コードへの影響

| パッケージ | 変更内容 |
|---|---|
| `internal/task/` | migration で FK 追加のみ。コード変更なし |
| `internal/chat/room/` | `RoomID int64`, `UserID1/2 int64` → UUID 化、room_members テーブルへ移行 |
| `internal/chat/message/` | `RoomID int64`, `MessengerID int64` → UUID 化 |
| `internal/chat/websocket/` | userID を `int64` → `uuid.UUID` に変更、Cookie 認証を追加 |
