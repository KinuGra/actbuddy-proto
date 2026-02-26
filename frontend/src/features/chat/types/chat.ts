export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage?: Message;
  unreadCount: number;
}
