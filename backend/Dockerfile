FROM golang:1.23.0 AS builder
WORKDIR /app/backend

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o social ./cmd/main.go

FROM debian:stable-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates sqlite3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/backend/social ./

COPY --from=builder /app/backend/pkg/db/migrations ./pkg/db/migrations

RUN mkdir -p /data/sqlite /logs

EXPOSE 8080

CMD ["./social"]
