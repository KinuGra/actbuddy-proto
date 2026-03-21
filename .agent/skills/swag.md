# swag (Swagger) ドキュメント生成

## 概要

swaggo/swag を使って Go の Swagger ドキュメントを管理する。

## ルール

### ハンドラの書き方

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

### docs の再生成

ハンドラを追加・変更したら必ず実行:

```bash
cd backend && swag init
```

## ワークフロー

1. `internal/.../handler.go` に named function でハンドラを書く
2. 関数の上に swag アノテーションを追加
3. `swag init` で docs を再生成
4. `http://localhost:8080/swagger/index.html` で確認

## よく使う @Param の書き方

| 種別 | 書き方 |
|------|--------|
| パスパラメータ | `@Param id path string true "説明"` |
| クエリパラメータ | `@Param page query int false "ページ番号"` |
| リクエストボディ | `@Param body body RequestType true "説明"` |
| ヘッダー | `@Param Authorization header string true "Bearer token"` |

## WebSocket

swag は WebSocket を正式サポートしていないのでアノテーションはスキップする。
