'use client'

import { useState, useEffect } from 'react'
import { Buddy } from '../types/buddy'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export function useBuddies() {
  const [buddies, setBuddies] = useState<Buddy[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/api/buddy/relationships`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(
        (
          data: Array<{
            id: string
            partner: { id: string; display_name: string }
            status: string
            matched_at: string
            ends_at: string
            room_id: string
          }>
        ) => {
          setBuddies(
            data.map((r) => ({
              id: r.id,
              partnerId: r.partner.id,
              partnerName: r.partner.display_name,
              startDate: new Date(r.matched_at),
              endDate: new Date(r.ends_at),
              status: 'active',
              relationType: 'buddy',
              roomId: r.room_id,
            }))
          )
        }
      )
      .catch(() => setError('データの取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [])

  return { buddies, loading, error }
}
