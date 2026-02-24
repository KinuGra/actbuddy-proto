# 🚀 Development Commands

## Prettier

### フォーマット実行（コミット前に実行してください）

```bash
cd frontend
pnpm run format
```

## 🐳 Docker Compose

### 🔰 初回起動（ビルド込み）

```bash
docker compose up --build
```

### 通常起動（ビルド不要）

```bash
docker compose up
```

### 停止

```bash
docker compose down
```

### 完全リセット（DBボリュームも削除）

```bash
docker compose down -v
```

## Frontend（Next.js）

### 開発サーバー起動（ローカルのみ）

```bash
cd frontend
pnpm install
pnpm run dev
```

# ポート一覧

| Service  | Port |
| -------- | ---- |
| Frontend | 3000 |
| Backend  | 8080 |
| Postgres | 5432 |
