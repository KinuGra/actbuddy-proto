'use client'

import { useState, useCallback, useEffect } from 'react'
import { ActionItem, CalendarView, ActionItemStatus } from '../types/calendar'
import '@/lib/apiClient'
import {
  postApiV1ActionItems,
  putApiV1ActionItemsByUuid,
  deleteApiV1ActionItemsByUuid,
} from '@/client/sdk.gen'
import type { TaskActionItemResponse } from '@/client/types.gen'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export interface PartnerInfo {
  id: string
  displayName: string
  type: 'buddy' | 'friend'
}

function mapToActionItem(
  r: TaskActionItemResponse,
  ownerName?: string,
  ownerType?: 'self' | 'buddy' | 'friend'
): ActionItem {
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
    ownerName,
    ownerType,
  }
}

async function fetchActionItemsForUser(
  targetUserId?: string
): Promise<TaskActionItemResponse[]> {
  const url = targetUserId
    ? `${API_BASE}/api/v1/action-items?target_user_id=${targetUserId}`
    : `${API_BASE}/api/v1/action-items`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) return []
  const json = await res.json()
  return (json.data as TaskActionItemResponse[]) ?? []
}

export function useCalendar() {
  const { user: currentUser } = useCurrentUser()
  const [view, setView] = useState<CalendarView>('month')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [ownItems, setOwnItems] = useState<ActionItem[]>([])
  const [partnerItems, setPartnerItems] = useState<Map<string, ActionItem[]>>(
    new Map()
  )
  const [partners, setPartners] = useState<PartnerInfo[]>([])
  const [visibleUserIds, setVisibleUserIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // バディ・フレンド一覧を取得
  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/buddy/relationships`, {
        credentials: 'include',
      })
      if (!res.ok) return
      const data: Array<{
        id: string
        partner: { id: string; display_name: string }
        status: string
      }> = await res.json()

      const list: PartnerInfo[] = data.map((r) => ({
        id: r.partner.id,
        displayName: r.partner.display_name,
        type: r.status === 'active' ? 'buddy' : 'friend',
      }))
      setPartners(list)
    } catch {
      // ignore
    }
  }, [])

  // 自分のアイテムを取得
  const fetchOwnItems = useCallback(async (displayName: string) => {
    const raw = await fetchActionItemsForUser()
    setOwnItems(raw.map((r) => mapToActionItem(r, displayName, 'self')))
  }, [])

  // 特定パートナーのアイテムを取得
  const fetchPartnerItems = useCallback(
    async (partner: PartnerInfo) => {
      const raw = await fetchActionItemsForUser(partner.id)
      setPartnerItems((prev) => {
        const next = new Map(prev)
        next.set(
          partner.id,
          raw.map((r) => mapToActionItem(r, partner.displayName, partner.type))
        )
        return next
      })
    },
    []
  )

  // 全データ再取得
  const fetchItems = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    setError(null)
    try {
      await fetchOwnItems(currentUser.display_name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [currentUser, fetchOwnItems])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // currentUserが確定したら自分のIDを初期選択
  useEffect(() => {
    if (currentUser) {
      setVisibleUserIds((prev) => {
        if (prev.has(currentUser.id)) return prev
        return new Set([currentUser.id])
      })
    }
  }, [currentUser])

  // フィルター状態の変更に応じてパートナーアイテムを取得
  useEffect(() => {
    for (const partner of partners) {
      if (visibleUserIds.has(partner.id) && !partnerItems.has(partner.id)) {
        fetchPartnerItems(partner)
      }
    }
  }, [visibleUserIds, partners, partnerItems, fetchPartnerItems])

  const toggleUserVisibility = useCallback((userId: string) => {
    setVisibleUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }, [])

  // 表示対象アイテムを合成
  const actionItems: ActionItem[] = (() => {
    const result: ActionItem[] = []
    if (currentUser && visibleUserIds.has(currentUser.id)) {
      result.push(...ownItems)
    }
    for (const partner of partners) {
      if (visibleUserIds.has(partner.id)) {
        result.push(...(partnerItems.get(partner.id) ?? []))
      }
    }
    return result
  })()

  const addActionItem = useCallback(
    async (item: Omit<ActionItem, 'id' | 'createdAt'>) => {
      try {
        await postApiV1ActionItems({
          body: {
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
    currentUserId: currentUser?.id ?? null,
    partners,
    visibleUserIds,
    toggleUserVisibility,
    addActionItem,
    updateActionItemStatus,
    deleteActionItem,
    getItemsForDate,
    loading,
    error,
  }
}
