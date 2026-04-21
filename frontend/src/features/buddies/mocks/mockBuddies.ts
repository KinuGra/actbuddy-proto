import { Buddy } from '../types/buddy'

export const mockBuddies: Buddy[] = [
  {
    id: 'b1',
    partnerId: 'u1',
    partnerName: '田中太郎',
    startDate: new Date(2026, 1, 18),
    endDate: new Date(2026, 1, 25),
    status: 'active',
    relationType: 'buddy',
  },
  {
    id: 'b2',
    partnerId: 'u2',
    partnerName: '佐藤花子',
    startDate: new Date(2026, 1, 21),
    endDate: new Date(2026, 1, 28),
    status: 'active',
    relationType: 'buddy',
  },
]

export const mockFriends: Buddy[] = [
  {
    id: 'f1',
    partnerId: 'u3',
    partnerName: '鈴木一郎',
    startDate: new Date(2026, 1, 4),
    endDate: new Date(2026, 1, 11),
    status: 'ended',
    relationType: 'friend',
  },
  {
    id: 'f2',
    partnerId: 'u4',
    partnerName: '高橋美咲',
    startDate: new Date(2026, 1, 11),
    endDate: new Date(2026, 1, 18),
    status: 'ended',
    relationType: 'friend',
  },
]
