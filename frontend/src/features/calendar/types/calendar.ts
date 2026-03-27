export type ActionItemStatus =
  | 'not_started'
  | 'completed'
  | 'progress_70'
  | 'progress_30'

export interface ActionItem {
  id: string
  userId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  kind: string
  status: ActionItemStatus
  createdAt: Date
  ownerName?: string
  ownerType?: 'self' | 'buddy' | 'friend'
}

export type CalendarView = 'month' | 'week' | 'day'

export interface CalendarState {
  view: CalendarView
  selectedDate: Date
  actionItems: ActionItem[]
}
