# API コード自動生成 (codegen)

バックエンドの Go アノテーションから Swagger spec を生成し、フロントエンドの TypeScript クライアントを自動生成する仕組み。

## 使用ツール

| ツール | 役割 |
|--------|------|
| [swaggo/swag](https://github.com/swaggo/swag) | Go のアノテーションから `swagger.json` を生成 |
| [@hey-api/openapi-ts](https://heyapi.dev/) | `swagger.json` から TypeScript クライアントを生成 |

## 全体の流れ

```
backend/main.go (Swagger アノテーション)
  ↓ swag init
backend/docs/swagger.json
  ↓ openapi-ts
frontend/src/client/  (自動生成 SDK)
  ↓ import
コンポーネント
```

## コマンド

API を変更したらプロジェクトルートで実行する:

```bash
make codegen
```

内部では以下を順番に実行する:

1. `cd backend && swag init -g main.go -o docs`
2. `cd frontend && pnpm run generate:api`

## バックエンド：アノテーションの書き方

### main.go のパッケージ情報

`package main` の直前に記述する:

```go
// @title           ActBuddy API
// @version         1.0
// @description     ActBuddy backend API
// @host            localhost:8080
// @BasePath        /
```

### ハンドラのアノテーション

> **注意**: アノテーションは **named function** にのみ有効。インライン関数（`r.GET("/path", func(c *gin.Context) {...})`）には効かない。

```go
// getHealth godoc
// @Summary      ヘルスチェック
// @Description  サーバーの死活確認
// @Tags         health
// @Produce      json
// @Success      200  {object}  map[string]bool
// @Router       /health [get]
func getHealth(c *gin.Context) {
    c.JSON(200, gin.H{"ok": true})
}
```

### @Param の書き方

| 種別 | 例 |
|------|----|
| パスパラメータ | `@Param id path string true "ユーザーID"` |
| クエリパラメータ | `@Param page query int false "ページ番号"` |
| リクエストボディ | `@Param body body RequestType true "リクエスト"` |
| ヘッダー | `@Param Authorization header string true "Bearer token"` |

## フロントエンド：クライアントの使い方

### 生成ファイル

`frontend/src/client/` 以下は自動生成ファイルのため **手動編集禁止**。変更したい場合はバックエンドのアノテーションを修正して `make codegen` を再実行する。

| ファイル | 内容 |
|----------|------|
| `sdk.gen.ts` | API 関数（`getHealth` など） |
| `types.gen.ts` | リクエスト/レスポンスの型定義 |
| `client.gen.ts` | fetch クライアント本体 |

### クライアントの初期化

`src/lib/apiClient.ts` で `baseUrl` を設定している。コンポーネントで SDK 関数を使う前に必ず import する:

```ts
// src/lib/apiClient.ts（設定済み・変更不要）
import { client } from "@/client/client.gen";

client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
});
```

### コンポーネントからの呼び出し例

```ts
'use client'

import '@/lib/apiClient'           // baseUrl を注入するために必ず import
import { getHealth } from '@/client/sdk.gen'

const res = await getHealth()
console.log(res.data?.ok)          // true
```

実際の使用例: `src/features/home/components/HealthStatus.tsx`

## Swagger UI

バックエンド起動中に以下で確認できる:

```
http://localhost:8080/swagger/index.html
```

## 注意事項

- **WebSocket** は swaggo が正式サポートしていないため、アノテーションはスキップする
- `make codegen` はバックエンドの `swag` コマンドが必要。未インストールの場合は `go install github.com/swaggo/swag/cmd/swag@latest` でインストールする
- 生成された `frontend/src/client/` は `.gitignore` に含めず、コミット対象とする（CI で生成する場合を除く）
