export type BuddyStatus = 'active' | 'ended'
export type RelationType = 'buddy' | 'friend'

export interface Buddy {
  id: string
  partnerId: string
  partnerName: string
  startDate: Date
  endDate: Date
  status: BuddyStatus
  relationType: RelationType
  roomId?: string
}
