'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  DashboardCapacity,
  DashboardProfile,
  TodayTask,
  TodayStats,
  TaskActionItemStatus,
} from '../types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

// --- raw API response shapes (snake_case) ---

interface RawCapacity {
  current_count: number
  max_count: number
  achievement_rate: number
}

interface RawProfile {
  goal_types: string[]
  bio: string
}

interface RawActionItem {
  uuid: string
  title: string
  status: TaskActionItemStatus
  kind: string
  start_time: string
  end_time: string
}

// --- 定数 ---

/** ステータスの表示優先度（低い数値が先） */
const STATUS_PRIORITY: Record<TaskActionItemStatus, number> = {
  not_started: 0,
  progress_30: 1,
  progress_70: 2,
  completed: 3,
}

// --- ユーティリティ ---

function getTodayRange(): { start: Date; end: Date } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function mapToTodayTask(item: RawActionItem): TodayTask {
  return {
    id: item.uuid,
    title: item.title,
    startTime: new Date(item.start_time),
    endTime: new Date(item.end_time),
    status: item.status,
  }
}

/**
 * 今日のタスク一覧を優先度順・期限順でソートして上位3件を返す。
 * ソート: not_started → progress_30/70 → completed の順、同ステータス内は期限が近い順。
 */
function computeBig3(tasks: TodayTask[]): TodayTask[] {
  return [...tasks]
    .sort((a, b) => {
      const pd = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
      if (pd !== 0) return pd
      return a.endTime.getTime() - b.endTime.getTime()
    })
    .slice(0, 3)
}

// --- フック ---

export interface UseDashboardReturn {
  capacity: DashboardCapacity | null
  profile: DashboardProfile | null
  /** 表示優先度順・期限順のトップ3タスク */
  big3: TodayTask[]
  /** 今日の全タスク集計（Big3 外のものも含む） */
  todayStats: TodayStats
  loading: boolean
  /**
   * タスクのステータスを楽観的更新で変更する。
   * API失敗時は自動的にロールバックする。
   */
  updateTaskStatus: (id: string, newStatus: TaskActionItemStatus) => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const [tasks, setTasks] = useState<TodayTask[]>([])
  const [capacity, setCapacity] = useState<DashboardCapacity | null>(null)
  const [profile, setProfile] = useState<DashboardProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { start, end } = getTodayRange()

    const fetchCapacity = fetch(`${API_BASE}/api/buddy/capacity`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? (r.json() as Promise<RawCapacity>) : null))
      .then((d) => {
        if (!d) return
        setCapacity({
          currentCount: d.current_count,
          maxCount: d.max_count,
          achievementRate: d.achievement_rate,
        })
      })
      .catch(() => null)

    const fetchProfile = fetch(`${API_BASE}/api/buddy/profile`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? (r.json() as Promise<RawProfile>) : null))
      .then((d) => {
        if (!d) return
        setProfile({ goalTypes: d.goal_types, bio: d.bio })
      })
      .catch(() => null)

    const fetchTasks = fetch(`${API_BASE}/api/v1/action-items`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: RawActionItem[] }>) : null))
      .then((body) => {
        if (!body?.data) return
        const todayTasks = body.data
          .filter((item) => {
            if (item.kind === 'break') return false
            const t = new Date(item.start_time)
            return t >= start && t <= end
          })
          .map(mapToTodayTask)
        setTasks(todayTasks)
      })
      .catch(() => null)

    Promise.allSettled([fetchCapacity, fetchProfile, fetchTasks]).then(() =>
      setLoading(false)
    )
  }, [])

  const big3 = useMemo(() => computeBig3(tasks), [tasks])

  const todayStats = useMemo(
    (): TodayStats => ({
      total: tasks.length,
      // progress_70 も「ほぼ完了」として完了扱いにする（既存ロジックを踏襲）
      completed: tasks.filter(
        (t) => t.status === 'completed' || t.status === 'progress_70'
      ).length,
    }),
    [tasks]
  )

  const updateTaskStatus = useCallback(
    async (id: string, newStatus: TaskActionItemStatus): Promise<void> => {
      // 楽観的更新：setTasks 内でロールバック用の元ステータスを取得
      let previousStatus: TaskActionItemStatus | null = null
      setTasks((prev) => {
        const task = prev.find((t) => t.id === id)
        if (task) previousStatus = task.status
        return prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      })

      try {
        const res = await fetch(`${API_BASE}/api/v1/action-items/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } catch {
        // API 失敗時はロールバック
        if (previousStatus !== null) {
          const ps = previousStatus
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: ps } : t)))
        }
      }
    },
    []
  )

  return { capacity, profile, big3, todayStats, loading, updateTaskStatus }
}
