'use client'

import { useEffect, useState } from 'react'
import '@/lib/apiClient'
import { getHealth } from '@/client/sdk.gen'

export default function HealthStatus() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    getHealth()
      .then((res) => {
        setStatus(res.data?.ok ? 'ok' : 'error')
      })
      .catch(() => setStatus('error'))
  }, [])

  const label = {
    loading: '確認中...',
    ok: 'サーバー: 正常',
    error: 'サーバー: 接続不可',
  }[status]

  const color = {
    loading: 'text-muted-foreground',
    ok: 'text-green-500',
    error: 'text-red-500',
  }[status]

  return <p className={`text-sm ${color}`}>{label}</p>
}
