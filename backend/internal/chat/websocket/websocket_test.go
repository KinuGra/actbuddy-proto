package websocket

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"log"

	"github.com/gorilla/websocket"
)

func TestServeWsSingleClient(t *testing.T) {
	hub := NewHub()
	go hub.run()

	// HTTP テストサーバー
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	}))
	defer server.Close()

	// WebSocket URL
	wsURL := "ws" + server.URL[len("http"):] + "/"

	// WebSocket 接続
	ws, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Dial error: %v", err)
	}
	defer ws.Close()

	// メッセージ送信
	if err := ws.WriteMessage(websocket.TextMessage, []byte("hello")); err != nil {
		t.Fatalf("Write error: %v", err)
	}

	// Hub から自分に返ってくるか確認
	_, msg, err := ws.ReadMessage()
	if err != nil {
		t.Fatalf("Read error: %v", err)
	}

	if string(msg) != "hello" {
		t.Fatalf("Expected 'hello', got %s", string(msg))
	}

	log.Printf("Client received %s successfully", string(msg))
}

func TestServeWsMultipleClients(t *testing.T) {
	hub := NewHub()
	go hub.run()

	// HTTP テストサーバー
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	}))
	defer server.Close()

	// WebSocket URL
	wsURL := "ws" + server.URL[len("http"):] + "/"

	// Client1 WebSocket 接続
	ws1, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Client1 Dial error: %v", err)
	}
	defer ws1.Close()

	// Client2 WebSocket 接続
	ws2, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Client2 Dial error: %v", err)
	}
	defer ws2.Close()

	// メッセージ送信
	if err := ws1.WriteMessage(websocket.TextMessage, []byte("hello")); err != nil {
		t.Fatalf("Write error: %v", err)
	}

	// Hub から自分に返ってくるか確認
	_, msg1, err := ws1.ReadMessage()
	if err != nil {
		t.Fatalf("Read error: %v", err)
	}

	if string(msg1) != "hello" {
		t.Fatalf("Expected 'hello', got %s", string(msg1))
	}

	log.Printf("Client1 received %s successfully", string(msg1))

	// Hub から自分に返ってくるか確認
	_, msg2, err := ws2.ReadMessage()
	if err != nil {
		t.Fatalf("Read error: %v", err)
	}

	if string(msg2) != "hello" {
		t.Fatalf("Expected 'hello', got %s", string(msg2))
	}

	log.Printf("Client2 received %s successfully", string(msg2))
}