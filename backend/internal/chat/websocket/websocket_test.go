package websocket

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// stubServeWs は認証・DB依存なしのテスト用 WebSocket ハンドラー
func stubServeWs(hub *Hub, userID uuid.UUID, displayName string, roomIDs []uuid.UUID, msgSvc stubMsgSvc, w http.ResponseWriter, r *http.Request) {
	var up = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
	conn, err := up.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	client := NewClient(userID, displayName, roomIDs, hub, conn, make(chan []byte, 256), nil)
	hub.register <- client
	go client.writePump()
	client.readPump()
}

// stubMsgSvc はテスト用のダミー型（未使用、コンパイル確認用）
type stubMsgSvc struct{}

func TestHubBroadcastToRoom(t *testing.T) {
	hub := NewHub()
	go hub.Run()

	roomID := uuid.New()
	userA := uuid.New()
	userB := uuid.New()
	userC := uuid.New()

	// room1: userA, userB  /  room2: userC
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userParam := r.URL.Query().Get("user")
		switch userParam {
		case "a":
			stubServeWs(hub, userA, "A", []uuid.UUID{roomID}, stubMsgSvc{}, w, r)
		case "b":
			stubServeWs(hub, userB, "B", []uuid.UUID{roomID}, stubMsgSvc{}, w, r)
		default:
			stubServeWs(hub, userC, "C", []uuid.UUID{uuid.New()}, stubMsgSvc{}, w, r)
		}
	}))
	defer server.Close()

	wsURL := func(user string) string {
		return "ws" + server.URL[len("http"):] + "/?user=" + user
	}

	wsA, _, err := websocket.DefaultDialer.Dial(wsURL("a"), nil)
	if err != nil {
		t.Fatalf("Dial A error: %v", err)
	}
	defer wsA.Close()

	wsB, _, err := websocket.DefaultDialer.Dial(wsURL("b"), nil)
	if err != nil {
		t.Fatalf("Dial B error: %v", err)
	}
	defer wsB.Close()

	wsC, _, err := websocket.DefaultDialer.Dial(wsURL("c"), nil)
	if err != nil {
		t.Fatalf("Dial C error: %v", err)
	}
	defer wsC.Close()

	// Hub が BroadcastMessage を受け取りルーム内のクライアントにだけ送る
	payload, _ := json.Marshal(OutgoingMessage{
		ID:         1,
		RoomID:     roomID.String(),
		SenderID:   userA.String(),
		SenderName: "A",
		Content:    "hello room",
		CreatedAt:  time.Now(),
	})
	hub.broadcast <- &BroadcastMessage{RoomID: roomID, Payload: payload}

	// A と B は受信できる
	for _, ws := range []*websocket.Conn{wsA, wsB} {
		ws.SetReadDeadline(time.Now().Add(500 * time.Millisecond))
		_, data, err := ws.ReadMessage()
		if err != nil {
			t.Errorf("expected message but got error: %v", err)
			continue
		}
		var msg OutgoingMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			t.Errorf("unmarshal error: %v", err)
		}
		if msg.Content != "hello room" {
			t.Errorf("unexpected content: %s", msg.Content)
		}
	}

	// C は受信しない
	wsC.SetReadDeadline(time.Now().Add(100 * time.Millisecond))
	_, _, err = wsC.ReadMessage()
	if err == nil {
		t.Error("C should not have received the message")
	}
}
