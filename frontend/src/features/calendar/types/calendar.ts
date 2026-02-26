export type ActionItemStatus = 'planned' | 'completed-70' | 'completed-30' | 'not-completed';

export interface ActionItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: ActionItemStatus;
  createdAt: Date;
}

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarState {
  view: CalendarView;
  selectedDate: Date;
  actionItems: ActionItem[];
}
