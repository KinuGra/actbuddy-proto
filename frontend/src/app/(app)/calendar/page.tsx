'use client'
import { useCalendar } from '@/features/calendar/hooks/useCalendar'
import { CalendarView } from '@/features/calendar/components/CalendarView'

export default function Calendar() {
  const {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    actionItems,
    addActionItem,
    updateActionItemStatus,
    deleteActionItem,
    loading,
    error,
  } = useCalendar()

  return (
    <div className="flex flex-col h-screen p-4">
      {error && (
        <div className="mb-2 p-2 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-2 p-2 text-sm text-muted-foreground">
          読み込み中...
        </div>
      )}
      <CalendarView
        events={actionItems}
        view={view}
        date={selectedDate}
        onView={setView}
        onNavigate={setSelectedDate}
        onAddItem={addActionItem}
        onUpdateStatus={updateActionItemStatus}
        onDelete={deleteActionItem}
      />
    </div>
  )
}
