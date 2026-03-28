'use client'

import { useState, useEffect, useCallback } from 'react'
import { Message, ChatRoom } from '../types/chat'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
const WS_BASE = API_BASE.replace(/^http/, 'ws')

export function useChat(initialRoomId?: string) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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
    const data: Array<{ id: string; partner: { id: string; display_name: string }; created_at: string }> =
      await res.json()
    setChatRooms(
      data.map((r) => ({
        id: r.id,
        participantId: r.partner.id,
        participantName: r.partner.display_name,
        unreadCount: 0,
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
          senderId: msg.sender_id === currentUserId ? 'current' : msg.sender_id,
          senderName: msg.sender_id === currentUserId ? 'あなた' : msg.sender_name,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          isRead: false,
        }
        setMessages((prev) => ({
          ...prev,
          [msg.room_id]: [...(prev[msg.room_id] ?? []), newMessage],
        }))
      } catch {
        // parse error は無視
      }
    },
    [currentUserId],
  )

  const getMessages = useCallback(
    (roomId: string) => messages[roomId] ?? [],
    [messages],
  )

  const wsURL = `${WS_BASE}/ws`

  return {
    chatRooms,
    currentUserId,
    wsURL,
    fetchMessages,
    addMessage,
    getMessages,
  }
}
