import { useState, useCallback } from 'react';
import { Message, ChatRoom } from '../types/chat';
import { mockMessages, mockChatRooms } from '../mocks/mockMessages';

export function useChat() {
  const [chatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const sendMessage = useCallback((roomId: string, content: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: 'current',
      senderName: 'あなた',
      content,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage],
    }));
  }, []);

  const getMessages = useCallback(
    (roomId: string) => {
      return messages[roomId] || [];
    },
    [messages]
  );

  return {
    chatRooms,
    messages,
    sendMessage,
    getMessages,
  };
}
