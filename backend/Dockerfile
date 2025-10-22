FROM golang:1.25-alpine as builder

RUN apk add --no-cache build-base sqlite-dev

WORKDIR /project

COPY go.mod ./

RUN go mod download

COPY . .

RUN go build -o social-network ./cmd/main.go

FROM alpine:latest

RUN apk add --no-cache sqlite-libs

WORKDIR /app

COPY --from=builder ./project/social-network .

EXPOSE 3000

CMD [ "./social-network" ]
