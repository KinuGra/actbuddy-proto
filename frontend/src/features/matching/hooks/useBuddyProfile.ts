'use client'

import { useState, useEffect, useCallback } from 'react'
import { BuddyProfile, UpsertProfileRequest } from '../types/matching'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export function useBuddyProfile() {
  const [profile, setProfile] = useState<BuddyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/buddy/profile`, {
        credentials: 'include',
      })
      if (res.status === 404) {
        setProfile(null)
        return
      }
      if (!res.ok) throw new Error('プロフィールの取得に失敗しました')
      setProfile(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const upsertProfile = useCallback(async (req: UpsertProfileRequest) => {
    const res = await fetch(`${API_BASE}/api/buddy/profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) throw new Error('プロフィールの保存に失敗しました')
    const updated: BuddyProfile = await res.json()
    setProfile(updated)
    return updated
  }, [])

  return { profile, loading, error, upsertProfile, refetch: fetchProfile }
}
