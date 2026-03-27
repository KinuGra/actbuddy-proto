# マッチングアルゴリズム

## 概要

バディを探しているユーザー同士を「多少待たせてでもより良いペア」でマッチングする。
即時マッチングではなく、定期的にスコアリングして最善のペアを選ぶ。

---

## マッチングの入力情報

`buddy_profiles` に登録されている以下の情報を使う。

| フィールド | 内容 | 例 |
|---|---|---|
| `goal_types` | 目標・趣味・興味の種類 | `['勉強', '運動']` |
| `active_times` | 活動時間帯 | `['morning', 'evening']` |
| `bio` | 自己紹介（現状スコアリングに使わない） | — |

---

## スコアリング

2ユーザー間のマッチングスコアを以下の式で計算する。

```
score = (goal_types の一致数 × 3)
      + (active_times の一致数 × 2)
      + 待機ボーナス
```

### 待機ボーナス

長く待っているユーザーを優先するため、待機時間に応じてボーナスを加算する。
これにより条件が完全には合わなくても、一定期間経過したら確実にマッチできるようにする。

| 待機時間 | ボーナス |
|---|---|
| 0〜24時間 | 0 |
| 1〜2日 | +1 |
| 2〜4日 | +3 |
| 4〜7日 | +6 |

---

## マッチング実行フロー

```
1. matching_queue から status = 'waiting' かつ expires_at > NOW() のユーザーを全件取得

2. 各ユーザーのバディ上限を確認
   - 現在 active なバディ数 < 上限 であれば候補に含める
   - 上限に達しているユーザーはスキップ

3. 候補ユーザーの全ペアのスコアを計算

4. スコアが最大のペアから順番にマッチング
   - すでに buddy / friend 関係のペアはスキップ
   - 過去にバディだった場合もスキップ（再マッチは不可）

5. マッチング成立ごとに
   a. buddy_relationships に INSERT
   b. rooms に INSERT（buddy_relationship_id を紐付け）
   c. room_members に両ユーザーを INSERT
   d. matching_queue の両ユーザーの status を 'matched' に UPDATE
   e. notifications に match_found を両ユーザーへ INSERT

6. 期限切れ（expires_at < NOW()）のキューを status = 'cancelled' に UPDATE
```

---

## 実行タイミング

- **定期実行**: 1時間ごとにバックグラウンドジョブとして実行
- **即時実行**: キューに新規ユーザーが参加したとき（任意）

> Go の実装方針: `main.go` でゴルーチンを起動し、`time.Ticker` で定期実行する。
> またはキュー参加 API のハンドラから goroutine を起動して非同期に実行する。

---

## バディ上限の計算

`buddy_relationships` と `action_items` から都度計算する（DBには保存しない）。

```sql
-- 現在のアクティブバディ数
SELECT COUNT(*) FROM buddy_relationships
WHERE (user_id_1 = $1 OR user_id_2 = $1)
  AND status = 'active'
  AND ends_at > NOW();

-- 直近7日間の達成率
SELECT
  COUNT(*) FILTER (WHERE status IN ('completed', 'progress_70')) AS achieved,
  COUNT(*) FILTER (WHERE kind != 'break') AS total
FROM action_items
WHERE user_id = $1
  AND start_time >= NOW() - INTERVAL '7 days'
  AND kind != 'break';
```

達成率 = achieved / total（total が 0 の場合は 0% とみなす）

| 達成率 | バディ上限 |
|---|---|
| total = 0 または達成率 < 40% | 1人 |
| 40% 〜 69% | 2人 |
| 70% 〜 | 3人 |

---

## バディ期間終了フロー

```
1. バックグラウンドジョブが ends_at < NOW() かつ status = 'active' を検索

2. buddy_relationships の status を 'ended'、ended_at = NOW() に UPDATE

3. 両ユーザーに通知を送る
   - title: 「バディ期間が終了しました」
   - body: 「{name} さんとのもくもく週間お疲れ様でした！
            フレンドになりますか？」
   - type: 'buddy_ended'（notifications table に追加）
   - metadata: { buddy_relationship_id, partner_id, partner_name }

4. 両ユーザーがフレンドになることを選択した場合
   - friend_relationships に INSERT
   - 相互に通知
```

---

## スコア例

ユーザー A: `goal_types=['勉強', '運動']`, `active_times=['morning', 'evening']`
ユーザー B: `goal_types=['勉強', '創作']`, `active_times=['morning']`
ユーザー C: `goal_types=['運動']`, `active_times=['evening', 'night']`

| ペア | goal一致 | time一致 | 待機ボーナス | 合計 |
|---|---|---|---|---|
| A × B | 1（勉強）×3 = 3 | 1（morning）×2 = 2 | 0 | **5** |
| A × C | 1（運動）×3 = 3 | 1（evening）×2 = 2 | 0 | **5** |
| B × C | 0 | 0 | 0 | **0** |

→ A×B または A×C が同スコアで最高。Aの待機が長ければ待機ボーナスで差がつく。
