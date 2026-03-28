package websocket

import (
	"log"
	"net/http"

	"backend/internal/auth"
	"backend/internal/chat/message"
	"backend/internal/chat/room"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		return origin == "http://localhost:3000" || origin == ""
	},
}

// ServeWs はWebSocket接続をアップグレードし、認証・ルーム取得後にクライアントを登録する
func ServeWs(hub *Hub, authSvc *auth.Service, roomSvc *room.RoomService, msgSvc *message.MessageService, w http.ResponseWriter, r *http.Request) {
	// session_token Cookie から認証
	tokenCookie, err := r.Cookie(auth.SessionCookieName)
	if err != nil {
		http.Error(w, "認証が必要です", http.StatusUnauthorized)
		return
	}

	user, err := authSvc.GetCurrentUser(r.Context(), tokenCookie.Value)
	if err != nil {
		http.Error(w, "無効なセッションです", http.StatusUnauthorized)
		return
	}

	// ユーザーのルームID一覧を取得（DB）
	roomIDs, err := roomSvc.GetUserRoomIDs(r.Context(), user.ID)
	if err != nil {
		log.Println("GetUserRoomIDs error:", err)
		http.Error(w, "サーバーエラー", http.StatusInternalServerError)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	client := NewClient(user.ID, user.DisplayName, roomIDs, hub, conn, make(chan []byte, 256), msgSvc)
	hub.register <- client

	go client.writePump()
	client.readPump()
}
