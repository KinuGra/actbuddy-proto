package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func TestServeWsSingleClient(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	// HTTP テストサーバー
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	}))
	defer server.Close()

	// WebSocket URL
	wsURL := "ws" + server.URL[len("http"):] + "/ws" + "?userId=11111111-1111-1111-1111-111111111111"

	// WebSocket 接続
	ws, resp, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		if resp != nil {
			t.Fatalf("Dial error: %v (status=%d)", err, resp.StatusCode)
		}
		t.Fatalf("Dial error: %v", err)
	}
	defer ws.Close()

	// メッセージ送信
	msg := ReadMessage{
		RoomID:   "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
		SenderID: "11111111-1111-1111-1111-111111111111",
		Content:  "hello room 1",
	}

	data, _ := json.Marshal(msg)

	// クライアントが送信
	if err := ws.WriteMessage(websocket.TextMessage, data); err != nil {
		t.Fatalf("Write error: %v", err)
	}

	// Hub から自分に返ってくるか確認
	_, data, err = ws.ReadMessage()
	if err != nil {
		t.Fatalf("Read error: %v", err)
	}

	var savedMessage SavedMessage

	err = json.Unmarshal(data, &savedMessage)
	if err != nil {
		t.Fatalf("Unmarshal error: %v", err)
	}

	fixedTime := time.Date(2026, 3, 14, 12, 0, 0, 0, time.UTC)

	expected := SavedMessage{
		MessageID:  "100",
		RoomID:   "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
		SenderID: "11111111-1111-1111-1111-111111111111",
		SenderName: "テストユーザー",
		Content:    "hello room 1",
		CreatedAt:  fixedTime,
	}

	if !reflect.DeepEqual(expected, savedMessage) {
		t.Errorf("unexpected messages.\ngot:  %+v\nwant: %+v", savedMessage, expected)
	}

	log.Printf("Client received %s successfully", string(savedMessage.Content))
}

func TestServeWsThreeClients(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	// HTTP テストサーバー
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	}))
	defer server.Close()

	getWsURL := func(userID string) string {
		return "ws" + server.URL[len("http"):] + "/ws?userId=" + userID
	}

	userIDs := []string{
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222",
    "33333333-3333-3333-3333-333333333333",
	}

	// 3人のクライアントを接続
	clients := make([]*websocket.Conn, 3)
	for i := 0; i < 3; i++ {
		ws, resp, err := websocket.DefaultDialer.Dial(getWsURL(userIDs[i]), nil)
		if err != nil {
			if resp != nil {
				t.Fatalf("Dial error: %v (status=%d)", err, resp.StatusCode)
			}
			t.Fatalf("Dial error: %v", err)
		}
		defer ws.Close()
		clients[i] = ws
	}

	// 1人目がメッセージ送信
	msg := ReadMessage{
		RoomID:   "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
		SenderID: "11111111-1111-1111-1111-111111111111",
		Content:  "hello everyone at room1",
	}
	data, _ := json.Marshal(msg)

	if err := clients[0].WriteMessage(websocket.TextMessage, data); err != nil {
		t.Fatalf("Write error: %v", err)
	}

	// クライアント1と2の受信を確認
	for i := 0; i < 2; i++ {
		_, recvData, err := clients[i].ReadMessage()
		if err != nil {
			t.Fatalf("Client %d read error: %v", i+1, err)
		}

		var savedMessage SavedMessage
		if err := json.Unmarshal(recvData, &savedMessage); err != nil {
			t.Fatalf("Client %d unmarshal error: %v", i+1, err)
		}

		if savedMessage.Content != msg.Content {
			t.Errorf("Client %d got unexpected content: %s", i+1, savedMessage.Content)
		}
	}

	// 3は受信できず
	clients[2].SetReadDeadline(time.Now().Add(100 * time.Millisecond)) // 短時間でタイムアウト
	_, _, err := clients[2].ReadMessage()
	if err == nil {
		t.Errorf("Client 3 should not have received the message")
	} else {
		// 期待通り受信していない
		log.Printf("Client 3 did not receive the message, as expected")
	}

	log.Printf("client1 and client 2 received the message successfully")
}
