'use client'
import { useState, useCallback } from 'react'
import {
  Calendar,
  type View,
  type SlotInfo,
  type ToolbarProps,
} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { localizer } from '../lib/calendarLocalizer'
import { getEffectiveUserId } from '../lib/effectiveUserId'
import {
  type ActionItem,
  type ActionItemStatus,
  type CalendarView,
} from '../types/calendar'
import { AddActionItemDialog } from './AddActionItemDialog'
import { ActionItemCard } from './ActionItemCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export interface CalendarEvent {
  title: string
  start: Date
  end: Date
  resource: ActionItem
}

function toCalendarEvent(item: ActionItem): CalendarEvent {
  return {
    title: item.title,
    start: item.startTime,
    end: item.endTime,
    resource: item,
  }
}

const statusColors: Record<ActionItemStatus, string> = {
  not_started: '#3b82f6',
  completed: '#22c55e',
  progress_70: '#4ade80',
  progress_30: '#eab308',
}

const VIEW_LABELS: Record<View, string> = {
  month: '月',
  week: '週',
  day: '日',
  agenda: 'agenda',
  work_week: 'work_week',
}

interface CustomToolbarProps extends ToolbarProps<CalendarEvent> {
  onAddItem: (item: Omit<ActionItem, 'id' | 'createdAt'>) => void
  selectedDate: Date
}

function CustomToolbar({
  date,
  view,
  onNavigate,
  onView,
  onAddItem,
  selectedDate,
}: CustomToolbarProps) {
  const label = () => {
    if (view === 'month') return format(date, 'yyyy年MM月', { locale: ja })
    if (view === 'week') {
      const start = new Date(date)
      start.setDate(date.getDate() - date.getDay())
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return `${format(start, 'MM月dd日', { locale: ja })} 〜 ${format(end, 'MM月dd日', { locale: ja })}`
    }
    return format(date, 'yyyy年MM月dd日 (E)', { locale: ja })
  }

  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')}>
          今日
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <span className="text-lg font-semibold ml-2">{label()}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {(['month', 'week', 'day'] as View[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={view === v ? 'default' : 'outline'}
              onClick={() => onView(v)}
            >
              {VIEW_LABELS[v]}
            </Button>
          ))}
        </div>
        <AddActionItemDialog selectedDate={selectedDate} onAdd={onAddItem} />
      </div>
    </div>
  )
}

interface CalendarViewProps {
  events: ActionItem[]
  view: CalendarView
  date: Date
  onView: (view: CalendarView) => void
  onNavigate: (date: Date) => void
  onAddItem: (item: Omit<ActionItem, 'id' | 'createdAt'>) => void
  onUpdateStatus: (id: string, status: ActionItemStatus) => void
  onDelete: (id: string) => void
}

export function CalendarView({
  events,
  view,
  date,
  onView,
  onNavigate,
  onAddItem,
  onUpdateStatus,
  onDelete,
}: CalendarViewProps) {
  const effectiveUserId = getEffectiveUserId()
  const [dialogSlot, setDialogSlot] = useState<{
    start: Date
    end: Date
  } | null>(null)
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null)

  const calendarEvents = events.map(toCalendarEvent)

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: statusColors[event.resource.status],
        opacity:
          event.resource.userId !== effectiveUserId ? 0.7 : 1,
        border:
          event.resource.userId !== effectiveUserId
            ? '2px dashed rgba(0,0,0,0.3)'
            : 'none',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '0.75rem',
      },
    }),
    [effectiveUserId]
  )

  const handleSelectSlot = useCallback((slot: SlotInfo) => {
    setDialogSlot({ start: slot.start, end: slot.end })
  }, [])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedItem(event.resource)
  }, [])

  const components = {
    toolbar: (props: ToolbarProps<CalendarEvent>) => (
      <CustomToolbar {...props} onAddItem={onAddItem} selectedDate={date} />
    ),
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0">
        <div className="h-[92%]">
          <Calendar<CalendarEvent>
            localizer={localizer}
            events={calendarEvents}
            view={view as View}
            date={date}
            onView={(v) => onView(v as CalendarView)}
            onNavigate={onNavigate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventPropGetter}
            components={components}
            style={{ height: '100%', minHeight: 0 }}
            culture="ja"
            messages={{
              today: '今日',
              previous: '前',
              next: '次',
              month: '月',
              week: '週',
              day: '日',
              agenda: 'アジェンダ',
              date: '日付',
              time: '時間',
              event: 'イベント',
              noEventsInRange: 'この期間にイベントはありません',
              showMore: (total) => `+${total}件`,
            }}
          />
        </div>
      </div>

      {/* 空スロットクリック → 追加ダイアログ */}
      {dialogSlot && (
        <AddActionItemDialog
          selectedDate={dialogSlot.start}
          slotEnd={dialogSlot.end}
          onAdd={(item) => {
            onAddItem(item)
            setDialogSlot(null)
          }}
          defaultOpen
          onOpenChange={(open) => {
            if (!open) setDialogSlot(null)
          }}
        />
      )}

      {/* イベントクリック → ステータス変更・削除 */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <ActionItemCard
              item={selectedItem}
              onStatusChange={(id, status) => {
                onUpdateStatus(id, status)
                setSelectedItem(null)
              }}
              onDelete={(id) => {
                onDelete(id)
                setSelectedItem(null)
              }}
              isOwnItem={selectedItem.userId === effectiveUserId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
