# 機能仕様

## 優先順位

| 優先度 | 機能 | 実装状況 |
|---|---|---|
| 最優先 | 認証認可 | **完了** |
| 最優先 | マッチング（バディ）機能 | 未実装 |
| 最優先 | カレンダー機能 | バックエンドAPI済・フロント実装済（要改修） |
| 最優先 | チャット機能 | バックエンド骨格済・フロント実装済（要改修） |
| 最優先 | 通知機能 | 未実装 |

---

## 1. 認証・認可

### 実装済み

- `POST /api/auth/signup` — ユーザー登録
- `POST /api/auth/login` — ログイン
- `POST /api/auth/logout` — ログアウト
- `GET /api/auth/me` — ログイン中ユーザー取得

### 認可方針

- 未認証ユーザーは `/login`、`/signup` のみアクセス可能
- フロントエンド: Next.js middleware で `session_token` Cookie を確認
- バックエンド: `AuthMiddleware` で保護ルートを守る

---

## 2. バディ・フレンド

### バディとは

- マッチング成立後、**1週間限定**でもくもく会をやる相手
- 1週間後にバディ関係は自動解消し、**フレンドになるかを両者が選べる**
- バディのAction Itemは自分のカレンダーに見やすい位置で強制表示される

### バディ同時人数の上限

達成率に応じて同時にバディになれる人数が増える。

| 達成率（直近7日） | 同時バディ上限 |
|---|---|
| 〜 39% | 1人 |
| 40% 〜 69% | 2人 |
| 70% 〜 | 3人 |

> 達成率 = 完了または progress_70 以上の Action Item 数 ÷ 全 Action Item 数（休憩除く）

### フレンドとは

- バディ期間終了後に選択できる長期的な関係
- バディと同様に Action Item を共有できる
- チャット可能
- バディのような期限はない

---

## 3. マッチング機能

### フロー

```
1. プロフィール設定（goal_types, active_times, bio）
2. 「バディを探す」ボタンを押す → matching_queue に登録
3. バックグラウンドで待機中ユーザーのスコアリングを実施
4. 良いペアが見つかり次第マッチング成立（最大7日待機）
5. 成立 → buddy_relationships 作成 → チャットルーム自動作成 → 両者に通知
```

### API（未実装）

| メソッド | パス | 説明 | 認証 |
|---|---|---|---|
| GET | `/api/buddy/profile` | 自分のプロフィール取得 | 必要 |
| PUT | `/api/buddy/profile` | プロフィール更新 | 必要 |
| POST | `/api/buddy/matching/join` | マッチングキューに参加 | 必要 |
| DELETE | `/api/buddy/matching/leave` | マッチングキューから離脱 | 必要 |
| GET | `/api/buddy/matching/status` | 自分のキュー状態確認 | 必要 |
| GET | `/api/buddy/relationships` | バディ・フレンド一覧 | 必要 |
| POST | `/api/buddy/relationships/{id}/end` | バディ期間終了（フレンドになるかを選択） | 必要 |

アルゴリズム詳細は `docs/matching-algorithm.md` を参照。

---

## 4. カレンダー機能（Action Item）

### Action Item の定義

「何時から何時まで何をやるか」を登録するタスク単位。カレンダー上に表示される。

### 休憩時間

- `kind = 'break'` として登録する
- カレンダー上で色を変えて表示（チェック不要）
- **休憩を先に入れることで自分に選択肢を与えない**設計

### チェック（ステータス）

カレンダーから直接タップして変更できる。

| 値 | 表示名 | 意味 |
|---|---|---|
| `not_started` | 未着手 | デフォルト |
| `progress_30` | あまりできなかった | 少しでも手をつけた |
| `progress_70` | だいぶできた | 惜しい。十分頑張ってる |
| `completed` | 完了！ | やり切った |

> 「あまりできなかった」も「できなかった」ではなく肯定的に表現する。
> 修正回数の制限は設けない。

### 公開ルール

- バディおよびフレンドには **強制公開**（プライバシー設定なし）
- バディのAction Itemはカレンダーの見やすい位置（背景色を変える等）に表示
- フレンドのAction Itemは少し控えめな表示でも可

### 実装済み API

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/v1/action-items` | 作成（認証必須・user_idはセッションから取得） |
| GET | `/api/v1/action-items` | 自分のアイテム一覧取得（認証必須） |
| GET | `/api/v1/action-items?target_user_id={uuid}` | バディ/フレンドのアイテム一覧取得（権限チェックあり） |
| GET | `/api/v1/action-items/{uuid}` | 1件取得 |
| PUT | `/api/v1/action-items/{uuid}` | 更新 |
| DELETE | `/api/v1/action-items/{uuid}` | 削除 |

### 未実装・TODO

- [x] `user_id` に外部キー制約を追加（migration 000003）
- [x] `kind = 'break'` のフロント表示対応（色分け、ステータス変更UI非表示）
- [x] バディ・フレンドの Action Item を取得するAPI（`FindByUserIDAsPartner` でbuddy/friend_relationships JOIN）
- [x] カレンダー上でのステータス変更UI（肯定的文言：「だいぶできた」等）
- [x] 月・週・日ビュー切り替え
- [x] バディのAction Itemをカレンダーに重ねて表示（トグルフィルターUI）

---

## 5. チャット機能

### 方針

- バディ・フレンドと 1:1 の LINE 風チャット
- リアルタイム通信は WebSocket
- バディマッチング成立時にチャットルームを自動作成

### 現状の問題

- rooms / messages が `int64` で実装されており、`users` の `UUID` と不整合
- WebSocket の userID が `int64`（仮実装）
- Hub の rooms 管理がハードコード（`testRooms`）

### 未実装・TODO

- [ ] rooms / messages を UUID ベースに移行（migration 000004）
- [ ] チャットルーム一覧 API
- [ ] メッセージ履歴 API（ページネーション付き）
- [ ] WebSocket で `session_token` Cookie を使った認証
- [ ] Hub の rooms 管理を DB から取得

### API 設計（未実装）

| メソッド | パス | 説明 | 認証 |
|---|---|---|---|
| GET | `/api/rooms` | 参加ルーム一覧 | 必要 |
| GET | `/api/rooms/{id}/messages?before={id}&limit=30` | メッセージ履歴 | 必要 |
| WS | `/ws` | リアルタイム送受信 | 必要（Cookie） |

---

## 6. 通知機能

### 方針

- 現フェーズはポップアップのみ（Web Push / PWA は後から対応）
- 文言は自己肯定感を高めるトーンで

### 通知の種類

| type | トリガー | メッセージ例 |
|---|---|---|
| `action_item_reminder` | 当日21時時点で Action Item が 0 件 | 「今日の予定はどうですか？できない日も全然OK！気が向いたら登録してみて」 |
| `match_found` | バディマッチング成立 | 「バディが見つかりました！{name} さんと一週間一緒に頑張りましょう 🎉」 |
| `new_message` | 未読メッセージ受信 | 「{name} からメッセージが届いています」 |

詳細は `docs/notification-spec.md` を参照。

---

## 実装ロードマップ

```
Phase 1（DB基盤）
  ├── migration 000003: action_items FK, buddy_profiles, matching_queue, buddy_relationships, friend_relationships
  ├── migration 000004: rooms, room_members, messages（UUID化）
  └── migration 000005: notifications

Phase 2（マッチング）
  ├── buddy_profiles API
  ├── matching_queue API
  ├── マッチングアルゴリズム（バックグラウンドジョブ）
  └── フロント: マッチング画面、バディプロフィール設定

Phase 3（チャット整合）
  ├── rooms/messages UUID移行
  ├── WebSocket 認証
  ├── rooms/messages API
  └── Hub を DB ベースに刷新

Phase 4（通知）
  ├── notifications API（GET/PUT）
  ├── action_item_reminder バッチ（毎日21時）
  └── フロント: 通知ポップアップ UI

Phase 5（カレンダー拡張）
  ├── バディ・フレンドの Action Item をカレンダーに重ねて表示
  ├── 休憩時間の表示対応
  └── ステータス変更 UI の改善

Phase 6（バディ期間管理）
  └── 1週間後の自動解消 + フレンド申請フロー
```
