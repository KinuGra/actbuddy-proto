import { useState, useCallback } from 'react'
import { Message, ChatRoom } from '../types/chat'
import { mockMessages, mockChatRooms } from '../mocks/mockMessages'

export function useChat() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(mockMessages)

  const fetchChatRooms = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/rooms/user/11111111-1111-1111-1111-111111111111`)
      console.log(res);
      if (!res.ok) throw new Error('Failed to fetch chat rooms')

      const jsonData = await res.json()

      const data: ChatRoom[] = jsonData.map((room: any) => ({
        id: room.id,
        participantId: room.participant_id,
        participantName: "テストユーザー", // 本来は room.participantName をセット
        lastMessage: undefined,
        unreadCount: 0,
      }));

      setChatRooms(data)
    } catch (err) {
      console.error(err)
    }
  }, [])


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
        roomId: `${msg.room_id}`,
        senderId: `${msg.sender_id}`,
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

  const addMessage = useCallback((userId: string, data: string) => {
    const msg = JSON.parse(data);
    const content = msg.content;

    if (userId == `${msg.sender_id}`) {
      // 自分のメッセージをUIに反映
      const newMessage: Message = {
        id: `${msg.message_id}`,
        roomId: `${msg.room_id}`,
        senderId: 'current',
        senderName: 'あなた',
        content,
        timestamp: new Date(),
        isRead: false,
      };
      setMessages((prev) => ({
        ...prev,
        [msg.room_id]: [...(prev[msg.room_id] || []), newMessage],
      }));
    } else {
      // 他のユーザーのメッセージをUIに反映
      const receivedMessage: Message = {
        id: `${msg.message_id}`,
        roomId: `${msg.room_id}`,
        senderId: `${msg.sender_id}`,
        senderName: msg.sender_name,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        isRead: false,
      };
      setMessages((prev) => ({
        ...prev,
        [msg.room_id]: [...(prev[msg.room_id] || []), receivedMessage],
      }));
    }
  }, []);

  const getMessages = useCallback(
    (roomId: string) => {
      return messages[roomId] || []
    },
    [messages]
  )

  return {
    fetchChatRooms,
    chatRooms,
    messages,
    sendMessage,
    getMessages,
    receiveMessage,
    addMessage,
  }
}
