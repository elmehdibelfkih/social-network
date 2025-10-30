local:
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
	
	@cd "./backend/" && go run ./cmd/main.go