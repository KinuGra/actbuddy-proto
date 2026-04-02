'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Message, ChatRoom } from '../types/chat'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
const WS_BASE = API_BASE.replace(/^http/, 'ws')

function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('session_token')
}

export function useChat(initialRoomId?: string) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const activeRoomIdRef = useRef<string | undefined>(undefined)
  const wsRef = useRef<WebSocket | null>(null)
  const addMessageRef = useRef<(data: string) => void>(() => {})

  // 現在のユーザーIDを取得
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => { if (user) setCurrentUserId(user.id) })
      .catch(() => {})
  }, [])

  // ルーム一覧取得
  const fetchRooms = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/rooms`, { credentials: 'include' })
    if (!res.ok) return
    const data: Array<{
      id: string
      partner: { id: string; display_name: string }
      created_at: string
      unread_count: number
    }> = await res.json()
    setChatRooms(
      data.map((r) => ({
        id: r.id,
        participantId: r.partner.id,
        participantName: r.partner.display_name,
        unreadCount: r.unread_count,
      })),
    )
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // メッセージ履歴取得
  const fetchMessages = useCallback(async (roomId: string) => {
    const res = await fetch(`${API_BASE}/api/rooms/${roomId}/messages`, {
      credentials: 'include',
    })
    if (!res.ok) return
    const data: Array<{
      id: number
      room_id: string
      sender_id: string
      sender_name: string
      content: string
      created_at: string
    }> = await res.json()
    setMessages((prev) => ({
      ...prev,
      [roomId]: data.map((m) => ({
        id: String(m.id),
        roomId: m.room_id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        content: m.content,
        timestamp: new Date(m.created_at),
        isRead: true,
      })),
    }))
  }, [])

  // 既読更新（addMessage より前に定義）
  const markRoomAsRead = useCallback(async (roomId: string) => {
    await fetch(`${API_BASE}/api/rooms/${roomId}/read`, {
      method: 'PUT',
      credentials: 'include',
    })
    setChatRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, unreadCount: 0 } : r)),
    )
  }, [])

  // WebSocket からのメッセージを受信して state に反映
  const addMessage = useCallback(
    (data: string) => {
      try {
        const msg: {
          id: number
          room_id: string
          sender_id: string
          sender_name: string
          content: string
          created_at: string
        } = JSON.parse(data)

        const newMessage: Message = {
          id: String(msg.id),
          roomId: msg.room_id,
          senderId: msg.sender_id,
          senderName: msg.sender_name,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          isRead: false,
        }
        setMessages((prev) => ({
          ...prev,
          [msg.room_id]: [...(prev[msg.room_id] ?? []), newMessage],
        }))

        // currentUserId が未取得の間は判定をスキップ
        if (currentUserId && msg.sender_id !== currentUserId) {
          if (msg.room_id === activeRoomIdRef.current) {
            // アクティブルームの新着はサーバー側の既読状態を更新
            markRoomAsRead(msg.room_id)
          } else {
            // 非アクティブルームは未読数をインクリメント
            setChatRooms((prev) =>
              prev.map((r) =>
                r.id === msg.room_id ? { ...r, unreadCount: r.unreadCount + 1 } : r,
              ),
            )
          }
        }
      } catch {
        // parse error は無視
      }
    },
    [currentUserId, markRoomAsRead],
  )

  // addMessage の最新版を ref で保持（WebSocket の onmessage から参照）
  useEffect(() => {
    addMessageRef.current = addMessage
  }, [addMessage])

  // WebSocket 接続（チャットページを開いている間は常に接続）
  useEffect(() => {
    const token = getSessionToken()
    const url = `${WS_BASE}/ws${token ? `?token=${token}` : ''}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => console.log('WebSocket opened')
    ws.onmessage = (event) => addMessageRef.current(event.data)
    ws.onclose = () => console.log('WebSocket disconnected')

    return () => ws.close()
  }, [])

  const getMessages = useCallback(
    (roomId: string) => messages[roomId] ?? [],
    [messages],
  )

  // アクティブルームを設定（未読カウント制御用）
  const setActiveRoom = useCallback((roomId: string | undefined) => {
    activeRoomIdRef.current = roomId
  }, [])

  // メッセージ送信
  const sendMessage = useCallback((roomId: string, content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ room_id: roomId, content }))
  }, [])

  return {
    chatRooms,
    currentUserId,
    fetchMessages,
    addMessage,
    getMessages,
    markRoomAsRead,
    setActiveRoom,
    sendMessage,
  }
}
