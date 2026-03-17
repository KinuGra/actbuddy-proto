# ────────────────────────────────
# マイグレーション（ローカルで実行）
# ────────────────────────────────

# 新しいマイグレーションファイル作成
# 使い方: make migrate-new NAME=create_buddy_pairs
migrate-new:
	cd backend && migrate create -ext sql -dir db/migrations -seq $(NAME)

# ────────────────────────────────
# マイグレーション（コンテナ内で実行）
# ────────────────────────────────

migrate-up:
	docker compose exec backend sh -c 'migrate -path /app/db/migrations -database "$$DATABASE_URL" up'

migrate-down:
	docker compose exec backend sh -c 'migrate -path /app/db/migrations -database "$$DATABASE_URL" down 1'

migrate-reset:
	docker compose exec backend sh -c 'migrate -path /app/db/migrations -database "$$DATABASE_URL" drop -f'

migrate-version:
	docker compose exec backend sh -c 'migrate -path /app/db/migrations -database "$$DATABASE_URL" version'

# ────────────────────────────────
# Docker
# ────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f backend

logs-all:
	docker compose logs -f

# ────────────────────────────────
# DB確認
# ────────────────────────────────

psql:
	docker compose exec postgres psql -U postgres -d actbuddy

db-tables:
	docker compose exec postgres psql -U postgres -d actbuddy -c "\dt"