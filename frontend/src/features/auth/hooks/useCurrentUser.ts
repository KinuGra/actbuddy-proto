'use client'

import { useEffect, useState } from 'react'
import type { UserResponse } from '../types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export function useCurrentUser() {
  const [user, setUser] = useState<UserResponse | null>(null)

  const refresh = () => {
    fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
  }

  useEffect(() => {
    refresh()
  }, [])

  return { user, refresh }
}
