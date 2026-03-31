'use client'
import dynamic from 'next/dynamic'
import { useCalendar } from '@/features/calendar/hooks/useCalendar'

const CalendarView = dynamic(
  () =>
    import('@/features/calendar/components/CalendarView').then(
      (m) => m.CalendarView
    ),
  { ssr: false }
)

export default function Calendar() {
  const {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    actionItems,
    currentUserId,
    partners,
    visibleUserIds,
    toggleUserVisibility,
    addActionItem,
    updateActionItemStatus,
    deleteActionItem,
    loading,
    error,
  } = useCalendar()

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] p-3 md:p-4">
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
        currentUserId={currentUserId}
        partners={partners}
        visibleUserIds={visibleUserIds}
        onToggleUser={toggleUserVisibility}
      />
    </div>
  )
}
