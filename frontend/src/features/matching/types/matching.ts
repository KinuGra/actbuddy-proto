export interface BuddyProfile {
  id: string
  user_id: string
  bio: string
  goal_types: string[]
  active_times: string[]
}

export interface UpsertProfileRequest {
  bio: string
  goal_types: string[]
  active_times: string[]
}

export interface QueueStatus {
  in_queue: boolean
  status?: string
  joined_at?: string
  expires_at?: string
}

export interface PartnerInfo {
  id: string
  display_name: string
}

export interface BuddyRelationship {
  id: string
  partner: PartnerInfo
  status: string
  matched_at: string
  ends_at: string
  room_id: string
}

export interface BuddyCapacity {
  current_count: number
  max_count: number
  achievement_rate: number
}
