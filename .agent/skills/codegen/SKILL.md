# swag / OpenAPI コードgen

## 概要

swaggo/swag で Go の Swagger spec を生成し、@hey-api/openapi-ts でフロントエンドの TypeScript クライアントを自動生成する。

## 全体の流れ

```
backend/main.go (アノテーション)
  → swag init → backend/docs/swagger.json
    → openapi-ts → frontend/src/client/ (自動生成SDK)
      → コンポーネントで使用
```

## 一括生成コマンド

APIを変更したら**必ずルートで実行**:

```bash
make codegen
```

内部的には:
1. `cd backend && swag init -g main.go -o docs`
2. `cd frontend && pnpm run generate:api`

## バックエンド：ハンドラの書き方

アノテーションは **named function** にのみ有効。インライン関数には付けられない。

```go
// handlerName godoc
// @Summary      概要
// @Description  詳細説明
// @Tags         タグ名
// @Accept       json
// @Produce      json
// @Param        id  path  string  true  "ID"
// @Success      200  {object}  ResponseType
// @Failure      400  {object}  map[string]string
// @Router       /path [get]
func handlerName(c *gin.Context) {
    // ...
}
```

### main.go のアノテーション

`package main` の上に記述する:

```go
// @title           ActBuddy API
// @version         1.0
// @description     ActBuddy backend API
// @host            localhost:8080
// @BasePath        /
```

## フロントエンド：クライアントの使い方

`frontend/src/client/` は手動編集禁止。`make codegen` で再生成する。

クライアントの初期化は `src/lib/apiClient.ts` で行う（`NEXT_PUBLIC_API_BASE_URL` を注入）。

```ts
// コンポーネントからの呼び出し例
import '@/lib/apiClient'           // baseUrl を設定するために必ずimport
import { getHealth } from '@/client/sdk.gen'

const res = await getHealth()
```

## よく使う @Param の書き方

| 種別 | 書き方 |
|------|--------|
| パスパラメータ | `@Param id path string true "説明"` |
| クエリパラメータ | `@Param page query int false "ページ番号"` |
| リクエストボディ | `@Param body body RequestType true "説明"` |
| ヘッダー | `@Param Authorization header string true "Bearer token"` |

## WebSocket

swag は WebSocket を正式サポートしていないのでアノテーションはスキップする。

## Swagger UI

`http://localhost:8080/swagger/index.html`
