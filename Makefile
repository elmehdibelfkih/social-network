local: setup
	@cd "./backend/" && go run ./cmd/main.go

setup:
	@mkdir -p "./logs/"
	@	: >> "./logs/backend-sqlite.log"
	@	: >> "./logs/backend.log"
	@	: >> "./logs/frontend.log"
	@	: >> "./logs/nginx-error.log"
	@mkdir -p "./data/"
	@mkdir -p "./data/sqlite"
	@mkdir -p "./data/uploads"
	@mkdir -p "./data/uploads/avatars"
	@mkdir -p "./data/uploads/posts"
	@mkdir -p "./data/uploads/messages"
	@mkdir -p "./data/uploads/comments"

up: setup
	docker compose -f ./docker-compose.yml up -d

build: setup
	docker compose -f ./docker-compose.yml build

down:
	docker compose -f ./docker-compose.yml down

status:
	docker compose -f ./docker-compose.yml ps
	docker logs

clean-logs:
	@rm -rf ./logs

clean-data:
	@rm -rf ./data

prune:clean-logs clean-data

re-prune: prune local

.PHONY: 
# todo:
# enter:
# 	docker exec -it forum bash