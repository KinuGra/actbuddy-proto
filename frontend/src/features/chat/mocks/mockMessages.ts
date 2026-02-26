import { Message, ChatRoom } from '../types/chat';

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      senderId: '1',
      senderName: '田中太郎',
      content: 'こんにちは！バディになれて嬉しいです。',
      timestamp: new Date(2026, 1, 23, 10, 0),
      isRead: true,
    },
    {
      id: 'm2',
      senderId: 'current',
      senderName: 'あなた',
      content: 'よろしくお願いします！',
      timestamp: new Date(2026, 1, 23, 10, 5),
      isRead: true,
    },
    {
      id: 'm3',
      senderId: '1',
      senderName: '田中太郎',
      content: 'もくもく会の日程ですが、今週の金曜日19時からどうでしょうか？',
      timestamp: new Date(2026, 1, 23, 11, 0),
      isRead: true,
    },
    {
      id: 'm4',
      senderId: 'current',
      senderName: 'あなた',
      content: '大丈夫です！金曜日19時で設定しますね。',
      timestamp: new Date(2026, 1, 23, 11, 10),
      isRead: true,
    },
    {
      id: 'm5',
      senderId: '1',
      senderName: '田中太郎',
      content: 'ありがとうございます！楽しみにしてます。',
      timestamp: new Date(2026, 1, 24, 9, 0),
      isRead: false,
    },
  ],
  '2': [
    {
      id: 'm6',
      senderId: '2',
      senderName: '佐藤花子',
      content: 'はじめまして！一緒に頑張りましょう！',
      timestamp: new Date(2026, 1, 22, 15, 0),
      isRead: true,
    },
    {
      id: 'm7',
      senderId: 'current',
      senderName: 'あなた',
      content: 'よろしくお願いします！',
      timestamp: new Date(2026, 1, 22, 15, 30),
      isRead: true,
    },
  ],
};

export const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    participantId: '1',
    participantName: '田中太郎',
    lastMessage: mockMessages['1'][mockMessages['1'].length - 1],
    unreadCount: 1,
  },
  {
    id: '2',
    participantId: '2',
    participantName: '佐藤花子',
    lastMessage: mockMessages['2'][mockMessages['2'].length - 1],
    unreadCount: 0,
  },
];
