import { useState, useCallback, useEffect } from 'react'
import { ActionItem, CalendarView, ActionItemStatus } from '../types/calendar'
import '@/lib/apiClient'
import {
  getApiV1ActionItems,
  postApiV1ActionItems,
  putApiV1ActionItemsByUuid,
  deleteApiV1ActionItemsByUuid,
} from '@/client/sdk.gen'
import type { TaskActionItemResponse } from '@/client/types.gen'

const USER_ID = process.env.NEXT_PUBLIC_CURRENT_USER_ID ?? ''

function mapToActionItem(r: TaskActionItemResponse): ActionItem {
  return {
    id: r.uuid ?? '',
    userId: r.user_id ?? '',
    title: r.title ?? '',
    description: r.description,
    startTime: new Date(r.start_time ?? ''),
    endTime: new Date(r.end_time ?? ''),
    kind: r.kind ?? 'task',
    status: (r.status ?? 'not_started') as ActionItemStatus,
    createdAt: new Date(r.created_at ?? ''),
  }
}

export function useCalendar() {
  const [view, setView] = useState<CalendarView>('month')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!USER_ID) return
    setLoading(true)
    setError(null)
    try {
      const res = await getApiV1ActionItems({ query: { user_id: USER_ID } })
      if (res.data) {
        const items = Object.values(res.data).flat()
        setActionItems(items.map(mapToActionItem))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addActionItem = useCallback(
    async (item: Omit<ActionItem, 'id' | 'createdAt'>) => {
      try {
        await postApiV1ActionItems({
          body: {
            user_id: USER_ID,
            title: item.title,
            description: item.description,
            start_time: item.startTime.toISOString(),
            end_time: item.endTime.toISOString(),
            kind: item.kind,
            status: item.status,
          },
        })
        await fetchItems()
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'アイテムの作成に失敗しました'
        )
      }
    },
    [fetchItems]
  )

  const updateActionItemStatus = useCallback(
    async (id: string, status: ActionItemStatus) => {
      try {
        await putApiV1ActionItemsByUuid({
          path: { uuid: id },
          body: { status },
        })
        await fetchItems()
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'ステータスの更新に失敗しました'
        )
      }
    },
    [fetchItems]
  )

  const deleteActionItem = useCallback(
    async (id: string) => {
      try {
        await deleteApiV1ActionItemsByUuid({ path: { uuid: id } })
        await fetchItems()
      } catch (e) {
        setError(e instanceof Error ? e.message : '削除に失敗しました')
      }
    },
    [fetchItems]
  )

  const getItemsForDate = useCallback(
    (date: Date) => {
      return actionItems.filter((item) => {
        const itemDate = new Date(item.startTime)
        return (
          itemDate.getFullYear() === date.getFullYear() &&
          itemDate.getMonth() === date.getMonth() &&
          itemDate.getDate() === date.getDate()
        )
      })
    },
    [actionItems]
  )

  return {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    actionItems,
    addActionItem,
    updateActionItemStatus,
    deleteActionItem,
    getItemsForDate,
    loading,
    error,
  }
}
