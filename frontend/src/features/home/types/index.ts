import type { TaskActionItemStatus } from '@/client/types.gen'

export type { TaskActionItemStatus }

/** 今日のアクションアイテム（ダッシュボード表示用） */
export interface TodayTask {
  id: string
  title: string
  startTime: Date
  endTime: Date
  status: TaskActionItemStatus
}

/** バディ枠情報 */
export interface DashboardCapacity {
  currentCount: number
  maxCount: number
  /** 0–1 の割合 */
  achievementRate: number
}

/** プロフィール情報 */
export interface DashboardProfile {
  goalTypes: string[]
  bio: string
}

/** 今日のタスク集計 */
export interface TodayStats {
  total: number
  /** completed または progress_70 を「完了」扱い */
  completed: number
}
