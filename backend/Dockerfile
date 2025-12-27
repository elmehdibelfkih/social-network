FROM golang:1.23.0 AS builder

WORKDIR /app/backend

COPY . .

RUN go build -o social ./cmd/main.go

FROM debian:stable-slim

RUN apt-get update && apt-get upgrade -y

WORKDIR /app/backend

COPY --from=builder /app/backend/social     .

EXPOSE 8080

CMD ["./social"]
