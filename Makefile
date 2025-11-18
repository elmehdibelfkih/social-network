NPM_CMD = npm
LOGS_PATH = "./logs/"
SQLITE_LOGS_PATH = ./logs/backend-sqlite.log
FRONTEND_LOGS_PATH = ./logs/frontend.log
NGINX_LOGS_PATH = ./logs/nginx-error.log
BACKEND_LOGS_PATH = ./logs/backend.log

DATA_PATH = ./data/
SQLITE_DATA_PATH = ./data/sqlite
UPLOADS_DATA_PATH = ./data/uploads
AVATARS_DATA_PATH = ./data/uploads/avatars
POSTS_DATA_PATH = ./data/uploads/posts
MESSAGES_DATA_PATH = ./data/uploads/messages
COMMENTS_DATA_PATH = ./data/uploads/comments

DOCKER_COMPOSE_PATH = ./docker-compose.yml

local: setup
	@echo "Starting backend and capturing PID..."
	@cd "./backend/" && go run ./cmd/main.go & echo
	@echo "Starting frontend..."
	@cd "./frontend/social-network" && npm run dev
	@echo "Frontend stopped. Cleaning up backend process..."
# 	@bash -c 'trap "echo \"Cleanup on SIGINT/SIGTERM/ERR\"; rm -f important_temp.file; exit 1" SIGINT SIGTERM ERR;
# 	@-if [ -f backend.pid ]; then kill $$(cat backend.pid); rm backend.pid; fi

setup:
	@mkdir -p $(LOGS_PATH)
	@	: >> $(SQLITE_LOGS_PATH)
	@	: >> $(FRONTEND_LOGS_PATH)
	@	: >> $(NGINX_LOGS_PATH)
	@	: >> $(BACKEND_LOGS_PATH)
	@mkdir -p $(DATA_PATH)
	@mkdir -p $(SQLITE_DATA_PATH)
	@mkdir -p $(UPLOADS_DATA_PATH)
	@mkdir -p $(AVATARS_DATA_PATH)
	@mkdir -p $(POSTS_DATA_PATH)
	@mkdir -p $(MESSAGES_DATA_PATH)
	@mkdir -p $(COMMENTS_DATA_PATH)
	@cd ./frontend/social-network && npm install
	@cd ./frontend/social-network && cp example.env .env

up: setup
	docker compose -f $(DOCKER_COMPOSE_PATH) up -d

build: setup
	docker compose -f $(DOCKER_COMPOSE_PATH) build

down:
	docker compose -f $(DOCKER_COMPOSE_PATH) down

status:
	docker compose -f $(DOCKER_COMPOSE_PATH) ps
	docker logs

clean-logs:
	@rm -rf $(LOGS_PATH)

clean-data:
	@rm -rf $(DATA_PATH)

clean-next:
	@rm -rf ./frontend/social-network/node_modules
	@rm -f ./frontend/social-network/package-lock.json
	@rm -rf ./frontend/social-network/.next


prune:clean-logs clean-data clean-next

re-prune: prune local

.PHONY: local setup up build down status clean-logs clean-data prune re-prune
.PHONY: local setup up build down status clean-logs clean-data prune re-prune
# todo:
# enter:
# 	docker exec -it forum bash