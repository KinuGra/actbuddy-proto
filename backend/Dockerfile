FROM golang:1.23-bookworm AS builder
WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN go build -o /app/server .

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
