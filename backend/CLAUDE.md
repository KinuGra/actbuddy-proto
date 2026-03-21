# actbuddy-proto バックエンド

## 技術スタック

- **言語**: Go
- **フレームワーク**: Gin
- **データベース**: PostgreSQL
- **マイグレーション**: golang-migrate
- **コンテナ**: Docker Compose

## ディレクトリ構成

```
buddy-app/
├── cmd/
│   └── server/
│       └── main.go                  ← エントリーポイント
│
├── internal/                        ← アプリケーションコード（外部公開しない）
│   ├── auth/                        ← 認証機能
│   │   ├── handler.go               ← HTTPハンドラー（リクエスト/レスポンス）
│   │   ├── service.go               ← ビジネスロジック
│   │   ├── repository.go            ← DB操作（インターフェース）
│   │   ├── repository_postgres.go   ← DB操作（PostgreSQL実装）
│   │   └── model.go                 ← 構造体定義
│   │
│   ├── buddy/                       ← バディマッチング機能
│   ├── task/                        ← タイムブロッキング / Action Item
│   ├── chat/                        ← チャット機能
│   ├── notification/                ← 通知機能
│   └── middleware/                  ← 共通ミドルウェア
│       ├── auth.go
│       ├── cors.go
│       └── logging.go
│
├── pkg/                             ← 汎用ユーティリティ（外部公開可能）
│   ├── response/json.go             ← 共通レスポンス形式
│   └── validator/validator.go       ← バリデーション
│
├── db/
│   └── migrations/                  ← golang-migrate のSQLファイル
│
├── config/
│   └── config.go                    ← 環境変数読み込み
│
├── docker-compose.yml
├── Makefile
├── go.mod
└── go.sum
```

## レイヤー構成（各フィーチャー）

各 `internal/[feature]/` は以下の4層で構成する：

| ファイル | 役割 |
|---|---|
| `handler.go` | HTTPハンドラー。リクエスト受取・バリデーション・レスポンス返却 |
| `service.go` | ビジネスロジック。handlerとrepositoryの間を繋ぐ |
| `repository.go` | DBアクセスのインターフェース定義 |
| `repository_postgres.go` | PostgreSQL実装 |
| `model.go` | 構造体定義（DB・リクエスト・レスポンス） |

## コーディング規約

- ハンドラーはビジネスロジックを持たない
- サービス層はDBの実装詳細を知らない（インターフェース経由）
- マイグレーションファイルは `000001_` 形式の連番プレフィックス
- エラーレスポンスは `pkg/response` の共通形式を使う
- 環境変数は `config/config.go` で一元管理する

## 現在の状態

- `main.go` はプロジェクトルートに仮置き（後で `cmd/server/main.go` へ移動予定）
- `internal/` 配下のフィーチャーディレクトリはこれから実装
- ヘルスチェックエンドポイント `GET /health` のみ実装済み
