import { Buddy } from '../types/buddy'
import { mockUsers } from '../../users/mocks/mockUsers'

export const mockBuddies: Buddy[] = [
  {
    id: 'b1',
    user: mockUsers[0], // 田中太郎
    startDate: new Date(2026, 1, 18),
    endDate: new Date(2026, 1, 25),
    status: 'active',
    relationType: 'buddy',
    canBecomeFriend: true,
  },
  {
    id: 'b2',
    user: mockUsers[1], // 佐藤花子
    startDate: new Date(2026, 1, 21),
    endDate: new Date(2026, 1, 28),
    status: 'active',
    relationType: 'buddy',
    canBecomeFriend: false,
  },
]

export const mockFriends: Buddy[] = [
  {
    id: 'f1',
    user: mockUsers[2], // 鈴木一郎
    startDate: new Date(2026, 1, 4),
    endDate: new Date(2026, 1, 11),
    status: 'completed',
    relationType: 'friend',
    canBecomeFriend: false,
  },
  {
    id: 'f2',
    user: mockUsers[3], // 高橋美咲
    startDate: new Date(2026, 1, 11),
    endDate: new Date(2026, 1, 18),
    status: 'completed',
    relationType: 'friend',
    canBecomeFriend: false,
  },
]
