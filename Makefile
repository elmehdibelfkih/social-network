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
#=============================================================

# local dev ==================================================
dev: start-backend start-frontend
stop-dev: stop-backend stop-frontend
start-backend: setup
	@echo "$(GREEN)Starting backend (Port 8080).$(RESET)"
	@echo "$(MAGENTA)Logs redirected to$(RESET) $(BACKEND_LOGS_PATH)..."
	@(cd "./backend/" && nohup go run ./cmd/main.go < /dev/null >> $(BACKEND_LOGS_PATH) 2>&1 &)
start-frontend: setup next-setup
	@echo "$(GREEN)Starting frontend (Port 3000).$(RESET)"
	@echo "$(MAGENTA)Logs redirected to$(RESET) $(FRONTEND_LOGS_PATH)..."
	@(cd $(FRONTEND_PATH) && nohup npm run dev < /dev/null >> $(FRONTEND_LOGS_PATH) 2>&1 &)
stop-backend:
	@echo "$(RED)Stopping backend process gracefully....$(RESET)"
	@fuser -k -s 8080/tcp || true
	@echo "$(GREEN)frontend stoped$(RESET)"
stop-frontend:
	@echo "$(RED)Stopping frontend process gracefully....$(RESET)"
	@fuser -k -s 3000/tcp || true
	@echo "$(GREEN)backend stoped$(RESET)"
restart-backend:
	@echo "$(RED)Stopping backend process gracefully....$(RESET)"
	@fuser -k -s 8080/tcp || true
	@$(MAKE) start-backend
restart-frontend:
	@echo "$(RED)Stopping frontend process gracefully....$(RESET)"
	@fuser -k -s 8080/tcp || true
	@$(MAKE) start-frontend
re-dev: stop-dev dev
re-purge-dev: stop-dev purge dev
#=============================================================

# deps  ======================================================
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
next-setup:
	@cd $(FRONTEND_PATH) && npm install
	@cd $(FRONTEND_PATH) && cp example.env .env
confirm:
	@echo -n "$(MAGENTA)Are you absolutely sure you want to run $(MAKECMDGOALS)?$(RESET) [$(RED)yes$(RESET)/$(GREEN)no$(RESET)]: " && \
	read REPLY; \
	if echo "$$REPLY" | grep -iq "^yes"; then \
		echo "✔️ $(RED)Confirmation received. Continuing...$(RESET)"; \
	else \
		echo "❌ $(GREEN)Operation cancelled by user.$(RESET)"; \
		exit 1; \
	fi
#=============================================================

# docker =====================================================
docker-up: setup
	@echo "$(GREEN)Building and starting Docker containers...$(RESET)"
	docker compose -f $(DOCKER_COMPOSE_PATH) up -d --build

docker-start: setup
	@echo "$(GREEN)Starting Docker containers...$(RESET)"
	docker compose -f $(DOCKER_COMPOSE_PATH) up -d

docker-stop:
	@echo "$(YELLOW)Stopping Docker containers...$(RESET)"
	docker compose -f $(DOCKER_COMPOSE_PATH) stop

docker-down:
	@echo "$(YELLOW)Stopping and removing Docker containers...$(RESET)"
	docker compose -f $(DOCKER_COMPOSE_PATH) down

docker-down-v:
	@echo "$(RED)Stopping and removing Docker containers with volumes...$(RESET)"
	docker compose -f $(DOCKER_COMPOSE_PATH) down -v

docker-build: setup
	@echo "$(GREEN)Building Docker images...$(RESET)"
	docker compose -f $(DOCKER_COMPOSE_PATH) build

docker-rebuild:
	@echo "$(GREEN)Rebuilding $(SERVICE)...$(RESET)"
	docker compose -f $(DOCKER_COMPOSE_PATH) build --no-cache $(SERVICE)

docker-logs:
	docker compose -f $(DOCKER_COMPOSE_PATH) logs -f

docker-logs-service:
	docker compose -f $(DOCKER_COMPOSE_PATH) logs -f $(SERVICE)

docker-status:
	docker compose -f $(DOCKER_COMPOSE_PATH) ps

docker-restart: docker-down docker-up

docker-prune: confirm
	@echo "$(RED)Pruning Docker system...$(RESET)"
	docker system prune -a --volumes -f

up: docker-up
build: docker-build
down: docker-down
status: docker-status
prune: docker-prune
#=============================================================

# clean ======================================================
clean-logs: confirm
	@echo "$(YELLOW)Cleaning logs files...$(RESET)"
	@rm -rf $(LOGS_PATH)
clean-data: confirm
	@echo "$(YELLOW)Cleaning data...$(RESET)"
	@rm -rf $(DATA_PATH)
clean-next:
	@echo "$(YELLOW)Cleaning Next.js artifacts and generated files...$(RESET)"
	@rm -rf $(FRONTEND_PATH)/node_modules
# 	@rm -f $(FRONTEND_PATH)/package-lock.json
	@rm -f $(FRONTEND_PATH)/yarn.lock
	@rm -f $(FRONTEND_PATH)/pnpm-lock.yaml
	@rm -rf $(FRONTEND_PATH)/.next
	@rm -rf $(FRONTEND_PATH)/out
	@rm -rf $(FRONTEND_PATH)/build
	@rm -rf $(FRONTEND_PATH)/dist
	@rm -rf $(FRONTEND_PATH)/.vercel
	@rm -rf $(FRONTEND_PATH)/.turbo
	@rm -f $(FRONTEND_PATH)/.env
	@rm -f $(FRONTEND_PATH)/npm-debug.log
	@rm -f $(FRONTEND_PATH)/yarn-error.log
	@rm -f $(FRONTEND_PATH)/next-env.d.ts
	@find $(FRONTEND_PATH) -type f -name ".DS_Store" -delete
purge: stop-dev clean-logs clean-data clean-next
	@echo "$(GREEN)purge: done$(RESET)"
#=============================================================


# re-prune: prune dev

.PHONY: dev stop-dev start-backend start-frontend stop-backend stop-frontend \
        restart-backend restart-frontend re-dev re-purge-dev \
        setup next-setup confirm \
        ssl-generate up build rebuild down down-volumes restart status \
        logs logs-backend logs-frontend logs-nginx logs-db \
        shell-backend shell-frontend shell-nginx shell-db \
        health ssl-check prune prune-safe \
        clean-logs clean-data clean-next purge