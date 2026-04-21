'use client'

import { useState, useEffect, useCallback } from 'react'
import { QueueStatus, BuddyRelationship, BuddyCapacity } from '../types/matching'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export function useMatching() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [relationships, setRelationships] = useState<BuddyRelationship[]>([])
  const [capacity, setCapacity] = useState<BuddyCapacity | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [queueRes, relsRes, capRes] = await Promise.all([
        fetch(`${API_BASE}/api/buddy/queue`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/buddy/relationships`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/buddy/capacity`, { credentials: 'include' }),
      ])
      if (queueRes.ok) setQueueStatus(await queueRes.json())
      if (relsRes.ok) setRelationships(await relsRes.json())
      if (capRes.ok) setCapacity(await capRes.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const joinQueue = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/buddy/queue`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? 'キューへの参加に失敗しました')
    }
    await fetchAll()
  }, [fetchAll])

  const leaveQueue = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/buddy/queue`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('キューからの退出に失敗しました')
    await fetchAll()
  }, [fetchAll])

  const endRelationship = useCallback(
    async (id: string) => {
      const res = await fetch(`${API_BASE}/api/buddy/relationships/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('バディ関係の終了に失敗しました')
      await fetchAll()
    },
    [fetchAll],
  )

  return {
    queueStatus,
    relationships,
    capacity,
    loading,
    joinQueue,
    leaveQueue,
    endRelationship,
    refetch: fetchAll,
  }
}
