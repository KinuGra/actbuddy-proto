# 通知仕様

## 概要

現フェーズはアプリ内ポップアップのみ。Web Push / PWA は将来対応。

文言は「できなくても大丈夫」「少しでも前進した自分を褒める」トーンを徹底する。

---

## 通知の種類

### `action_item_reminder`

**目的**: 今日の予定をカレンダーに登録することを促す。Action Itemがないと何をすべきか不明確になるため、バディやフレンドがいなくても毎日通知する。

**トリガー**: バッチジョブが毎日 21:00 JST に実行。その日の Action Item が 0 件のユーザーが対象。

**文言例**:

```
タイトル: 「今日の予定、どうでしたか？」
本文: 「まだ予定が登録されていません。
      できない日があっても全然OK！
      5分だけでも何かやることを書いてみませんか？😊」
```

> 「できない日がある」ことを責めず、気軽に登録できる雰囲気を作る。

---

### `match_found`

**目的**: バディが見つかったことを知らせ、チャットに誘導する。

**トリガー**: マッチングアルゴリズム実行後、マッチング成立時に即座に両ユーザーへ送信。

**文言例**:

```
タイトル: 「バディが見つかりました！」
本文: 「{partner_name} さんとマッチングしました 🎉
      今週1週間、一緒にもくもくしましょう！
      まずは挨拶してみましょう👋」
```

**metadata**:
```json
{
  "buddy_id": "uuid",
  "room_id": "uuid",
  "partner_name": "表示名"
}
```

---

### `new_message`

**目的**: チャットに未読メッセージがあることを知らせる。

**トリガー**: WebSocket でメッセージが送信されたとき。受信者がオンラインでない場合に通知を作成する（オンラインかどうかは Hub で管理）。

**文言例**:

```
タイトル: 「{sender_name} からメッセージ」
本文: メッセージ本文の先頭 50 文字
```

**metadata**:
```json
{
  "room_id": "uuid",
  "sender_name": "表示名"
}
```

---

### `buddy_ended`（将来追加）

**目的**: バディ期間（1週間）終了を伝え、フレンドになるか選べることを案内する。

**トリガー**: `ends_at` を過ぎた `buddy_relationships` を検出するバッチジョブ。

**文言例**:

```
タイトル: 「バディ期間が終了しました」
本文: 「{partner_name} さんとのもくもく週間、お疲れ様でした！✨
      フレンドとして引き続き繋がりますか？」
```

---

## フロントエンド実装方針

### ポーリング方式（現フェーズ）

未読通知を定期的に取得してポップアップ表示する。

```typescript
// 30秒ごとに未読通知を確認
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch('/api/notifications?unread=true', {
      credentials: 'include',
    })
    const notifications = await res.json()
    if (notifications.length > 0) {
      showPopup(notifications[0])
    }
  }, 30_000)
  return () => clearInterval(interval)
}, [])
```

### WebSocket 方式（将来対応）

既存の WebSocket 接続を使って、サーバーからプッシュで通知を受け取る。
メッセージタイプを追加するだけで対応可能。

```json
// WebSocket メッセージ例（通知用）
{
  "type": "notification",
  "payload": {
    "id": "uuid",
    "notification_type": "new_message",
    "title": "...",
    "body": "..."
  }
}
```

### ポップアップ UI

- 画面右下に表示（トースト形式）
- 5秒後に自動非表示
- クリックで既読化 + 関連画面に遷移
  - `match_found` → チャット画面
  - `new_message` → 該当チャットルーム
  - `action_item_reminder` → カレンダー画面

---

## バックエンド API

| メソッド | パス | 説明 | 認証 |
|---|---|---|---|
| GET | `/api/notifications` | 通知一覧（`?unread=true` で未読のみ、`?limit=20` でページング） | 必要 |
| PUT | `/api/notifications/{id}/read` | 1件既読化 | 必要 |
| PUT | `/api/notifications/read-all` | 全既読化 | 必要 |

---

## バッチジョブ一覧

| ジョブ | 実行タイミング | 処理 |
|---|---|---|
| `action_item_reminder` | 毎日 21:00 JST | 当日 Action Item 0 件のユーザーに通知 INSERT |
| `matching` | 1時間ごと | マッチングアルゴリズム実行（詳細は `matching-algorithm.md`） |
| `buddy_end_check` | 1時間ごと | `ends_at` 過ぎたバディを `ended` に更新し通知 |

> Go の実装方針: `main.go` または `cmd/worker/main.go` でゴルーチンを起動し `time.Ticker` で定期実行する。
