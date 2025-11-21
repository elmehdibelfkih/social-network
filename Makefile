RED=\e[31m
GREEN=\e[32m
BLUE=\e[34m
YELLOW=\e[33m
MAGENTA=\e[35m
CYAN=\e[36m
RESET=\e[0m

PROJECT_ROOT := $(shell pwd)

LOGS_PATH = "$(PROJECT_ROOT)/logs/"
SQLITE_LOGS_PATH = $(PROJECT_ROOT)/logs/backend-sqlite.log
FRONTEND_LOGS_PATH = $(PROJECT_ROOT)/logs/frontend.log
NGINX_LOGS_PATH = $(PROJECT_ROOT)/logs/nginx-error.log
BACKEND_LOGS_PATH = $(PROJECT_ROOT)/logs/backend.log

DATA_PATH = $(PROJECT_ROOT)/data/
SQLITE_DATA_PATH = $(PROJECT_ROOT)/data/sqlite
UPLOADS_DATA_PATH = $(PROJECT_ROOT)/data/uploads
AVATARS_DATA_PATH = $(PROJECT_ROOT)/data/uploads/avatars
POSTS_DATA_PATH = $(PROJECT_ROOT)/data/uploads/posts
MESSAGES_DATA_PATH = $(PROJECT_ROOT)/data/uploads/messages
COMMENTS_DATA_PATH = $(PROJECT_ROOT)/data/uploads/comments

DOCKER_COMPOSE_PATH = $(PROJECT_ROOT)/docker-compose.yml

FRONTEND_PATH = $(PROJECT_ROOT)/frontend/social-network

# local dev
dev: start-backend start-frontend
stop-dev:
	@echo "$(RED)Stopping processes gracefully....$(RESET)"
	@fuser -k -s 8080/tcp || true
	@fuser -k -s 3000/tcp || true
	@echo "$(GREEN)Cleanup complete.$(RESET)"
start-backend: setup
	@echo "$(GREEN)Starting backend (Port 8080).$(RESET)"
	@echo "$(MAGENTA)Logs redirected to$(RESET) $(BACKEND_LOGS_PATH)..."
	@(cd "./backend/" && nohup go run ./cmd/main.go < /dev/null >> $(BACKEND_LOGS_PATH) 2>&1 &)
start-frontend: setup
	@echo "$(GREEN)Starting frontend (Port 3000).$(RESET)"
	@echo "$(MAGENTA)Logs redirected to$(RESET) $(FRONTEND_LOGS_PATH)..."
	@(cd $(FRONTEND_PATH) && nohup npm run dev < /dev/null >> $(FRONTEND_LOGS_PATH) 2>&1 &)
#=============================================================

# setup ======================================================
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
	@cd $(FRONTEND_PATH) && npm install
	@cd $(FRONTEND_PATH) && cp example.env .env
#=============================================================

# docker =====================================================
up: setup
	docker compose -f $(DOCKER_COMPOSE_PATH) up -d
build: setup
	docker compose -f $(DOCKER_COMPOSE_PATH) build
down:
	docker compose -f $(DOCKER_COMPOSE_PATH) down
status:
	docker compose -f $(DOCKER_COMPOSE_PATH) ps
	docker logs
#=============================================================

# clean ======================================================
clean-logs:
	@echo "$(YELLOW)Cleaning logs files...$(RESET)"
	@rm -rf $(LOGS_PATH)
clean-data:
	@echo "$(YELLOW)Cleaning data...$(RESET)"
	@rm -rf $(DATA_PATH)
clean-next:
	@echo "$(YELLOW)Cleaning Next.js project files...$(RESET)"
	@rm -rf $(FRONTEND_PATH)/node_modules
	@rm -f $(FRONTEND_PATH)/package-lock.json
	@rm -f $(FRONTEND_PATH)/npm-debug.log
	@rm -f $(FRONTEND_PATH)/.env
	@rm -f $(FRONTEND_PATH)/next-env.d.ts
	@rm -f $(FRONTEND_PATH)/tsconfig.json
	@rm -rf $(FRONTEND_PATH)/.next
	@rm -rf $(FRONTEND_PATH)/out
	@rm -rf $(FRONTEND_PATH)/dist
	@rm -rf $(FRONTEND_PATH)/build
purge:clean-logs clean-data clean-next
#=============================================================


# re-prune: prune dev

# .PHONY: dev 
