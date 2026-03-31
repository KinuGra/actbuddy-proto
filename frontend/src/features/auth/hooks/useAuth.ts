'use client'

import { useState } from 'react'
import type { LoginRequest, SignupRequest, UserResponse } from '../types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

type AuthResponse = {
  token: string
  user: UserResponse
}

function setSessionCookie(token: string) {
  document.cookie = `session_token=${token}; path=/; max-age=86400`
  sessionStorage.setItem('session_token', token)
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signup = async (data: SignupRequest): Promise<UserResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'ユーザー登録に失敗しました')
        return null
      }
      const { token, user } = (await res.json()) as AuthResponse
      setSessionCookie(token)
      return user
    } catch {
      setError('ネットワークエラーが発生しました')
      return null
    } finally {
      setLoading(false)
    }
  }

  const login = async (data: LoginRequest): Promise<UserResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'ログインに失敗しました')
        return null
      }
      const { token, user } = (await res.json()) as AuthResponse
      setSessionCookie(token)
      return user
    } catch {
      setError('ネットワークエラーが発生しました')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { signup, login, loading, error }
}
