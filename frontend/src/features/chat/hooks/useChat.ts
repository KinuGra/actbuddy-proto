import { useState, useCallback } from 'react'
import { Message, ChatRoom } from '../types/chat'
import { mockMessages, mockChatRooms } from '../mocks/mockMessages'

export function useChat() {
  const [chatRooms] = useState<ChatRoom[]>(mockChatRooms)
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(mockMessages)

  // メッセージを送信する関数
  // ユーザーのUIに反映
  const sendMessage = useCallback((roomId: string, userId: string, data: string) => {
    const msg = JSON.parse(data);
    const content = msg.content;

    if (userId == `${msg.sender_id}`) {
      const newMessage: Message = {
        id: `m${Date.now()}`,
        roomId: roomId,
        senderId: 'current',
        senderName: 'あなた',
        content,
        timestamp: new Date(),
        isRead: false,
      }

      setMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), newMessage],
      }))
    }
  }, [])

  // サーバーからメッセージを受信したときに呼ばれる関数
  const receiveMessage = useCallback((userId: string, data: string) => {
    const msg = JSON.parse(data);

    // 受信メッセージが自分の送信メッセージでない場合のみUIに反映
    if (userId != `${msg.sender_id}`) {
      const receivedMessage: Message = {
        id: `${msg.message_id}`,
        roomId: msg.room_id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        content: msg.content,
        timestamp: msg.created_at,
        isRead: false,
      }

      setMessages((prev) => ({
        ...prev,
        [msg.room_id]: [...(prev[msg.room_id] || []), receivedMessage],
      }))
    }
  }, [])

  const getMessages = useCallback(
    (roomId: string) => {
      return messages[roomId] || []
    },
    [messages]
  )

  return {
    chatRooms,
    messages,
    sendMessage,
    getMessages,
    receiveMessage,
  }
}
