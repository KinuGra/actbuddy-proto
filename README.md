## 起動方法

```
docker compose -f docker-compose.yml -f docker-compose.devcontainer.yml up
```

## コマンドの実行

```
docker compose run --rm <サービス名> <コマンド>
```

### Examples

```
docker compose run --rm frontend npx prettier --write .
```
