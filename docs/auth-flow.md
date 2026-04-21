# フロントエンド認証フロー

## 概要

セッションベースの認証を使用。バックエンドが発行する `session_token` Cookie をブラウザが保持し、保護ルートへのアクセス時に Next.js サーバーサイドで検証する。

---

## エンドポイント

| メソッド | パス | 説明 | 認証 |
|---|---|---|---|
| POST | `/api/auth/signup` | ユーザー登録 | 不要 |
| POST | `/api/auth/login` | ログイン | 不要 |
| POST | `/api/auth/logout` | ログアウト | 必要 |
| GET | `/api/auth/me` | ログイン中ユーザー取得 | 必要 |

---

## ルート構成

```
app/
├── page.tsx                  # / → /login にリダイレクト
├── (auth)/                   # 認証ページ（ヘッダーなし）
│   ├── layout.tsx            # ロゴ・キャッチコピーを表示するシンプルなレイアウト
│   ├── login/page.tsx        # /login
│   └── signup/page.tsx       # /signup
└── (app)/                    # 保護ルート（ヘッダーあり）
    ├── layout.tsx            # ← サーバーサイドで認証チェック
    ├── dashboard/page.tsx
    └── ...
```

---

## 認証チェック（保護ルート）

`src/middleware.ts` が Next.js のミドルウェアとして動作し、すべてのリクエストで Cookie の存在を確認する。

```
ブラウザ → GET /dashboard
    ↓
middleware.ts（Edgeランタイム）
    ├─ session_token Cookie がない → redirect('/login')
    └─ session_token Cookie がある → リクエストを通過させる
          ↓
       (app)/layout.tsx → ページをレンダリング
```

> **なぜサーバーサイドで `/api/auth/me` を呼ばないか**
> Docker 環境では Next.js コンテナからバックエンドコンテナへの通信に内部ネットワーク URL (`http://backend:8080`) が必要で、ブラウザ用の `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` とは別に管理が必要になる。
> ミドルウェアは Cookie の存在チェックのみ行い、実際のセッション有効性は各ページの API 呼び出しで確認する。

---

## ログインフロー

```
1. ユーザーが /login でフォームを送信

2. useAuth().login() が呼ばれる
   fetch('http://localhost:8080/api/auth/login', {
     method: 'POST',
     credentials: 'include',   ← Cookie を送受信するために必須
     body: JSON.stringify({ email, password })
   })

3. バックエンドがレスポンスに Set-Cookie をセット
   Set-Cookie: session_token=<token>; Path=/; HttpOnly

4. ブラウザが session_token Cookie を保存（domain: localhost）

5. router.push('/dashboard') で画面遷移

6. (app)/layout.tsx が session_token を検証 → 通過 → ダッシュボードを表示
```

---

## 新規登録フロー

ログインフローと同様。エンドポイントが `/api/auth/signup` になり、リクエストボディに `display_name` が追加される。

```
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",   // 8文字以上
  "display_name": "表示名"
}
```

登録成功後もセッション Cookie がセットされ、そのまま `/dashboard` に遷移する。

---

## Cookie の仕様

| 属性 | 値 | 備考 |
|---|---|---|
| 名前 | `session_token` | |
| HttpOnly | true | JS からのアクセス不可（XSS 対策） |
| Secure | false | 開発環境のみ。本番では true |
| Domain | 未指定 | `localhost` として扱われる |
| Path | `/` | |
| 有効期限 | 24時間 | |

> **ポートとCookieについて**
> RFC 6265 の仕様上、Cookie はポートを区別しない。
> `localhost:8080` がセットした Cookie は `localhost:3000` へのリクエストにも付与されるため、バックエンドとフロントエンドがポートを分けて動作する開発環境でも正常に動作する。

---

## Docker 環境での注意点

Next.js サーバーサイドのfetch（`(app)/layout.tsx` 内）は、**コンテナ内部から**バックエンドを呼び出す。

| 呼び出し元 | 使用する URL | 理由 |
|---|---|---|
| ブラウザ（クライアントサイド） | `http://localhost:8080` | ホストマシン経由でバックエンドに到達 |
| Next.js サーバー（サーバーサイド） | `http://backend:8080` | Docker内部ネットワーク経由で直接到達 |

`localhost:8080` はコンテナ内では自分自身（Next.js コンテナ）を指すため、サーバーサイドで使うと接続できない。

### 環境変数の使い分け

```yaml
# docker-compose.yml
environment:
  - NEXT_PUBLIC_API_BASE_URL=http://localhost:8080  # ブラウザ用（クライアントサイド）
  - API_BASE_URL=http://backend:8080                # Next.jsサーバー用（サーバーサイド）
```

```typescript
// (app)/layout.tsx（サーバーサイド）
const apiBase =
  process.env.API_BASE_URL ??           // Docker環境: http://backend:8080
  process.env.NEXT_PUBLIC_API_BASE_URL ?? // フォールバック
  'http://localhost:8080'                // ローカル開発
```

---

## CORS 設定（バックエンド）

`credentials: 'include'` を使用するため、バックエンドの CORS に `AllowCredentials: true` が必須。

```go
// backend/main.go
r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,   // ← これがないと Cookie が送受信できない
}))
```

---

## 関連ファイル

| ファイル | 役割 |
|---|---|
| `src/features/auth/types/index.ts` | 型定義（SignupRequest, LoginRequest, UserResponse） |
| `src/features/auth/hooks/useAuth.ts` | API 呼び出しフック（signup / login） |
| `src/features/auth/components/LoginForm.tsx` | ログインフォーム |
| `src/features/auth/components/SignupForm.tsx` | 新規登録フォーム |
| `src/middleware.ts` | 保護ルートの Cookie 存在チェック（未認証なら `/login` へリダイレクト） |
| `src/app/(auth)/layout.tsx` | 認証ページ用レイアウト |
| `src/app/(app)/layout.tsx` | 保護ルートのレイアウト（Header を含む） |
