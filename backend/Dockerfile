# Build Stage
FROM golang:1.23.0 AS builder
WORKDIR /app/project
COPY ./project/. ./
RUN go build -o social main.go

FROM debian:stable-slim
RUN apt-get update && apt-get upgrade -y
WORKDIR /project

COPY --from=builder /app/project/social     .

EXPOSE 8080

CMD ["./social"]
