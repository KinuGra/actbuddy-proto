'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, Target, TrendingUp, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

interface CapacityData {
  current_count: number
  max_count: number
  achievement_rate: number
}

interface ProfileData {
  goal_types: string[]
  bio: string
}

interface TodayStats {
  total: number
  completed: number
}

export default function HomeMain() {
  const { user: currentUser } = useCurrentUser()
  const [capacity, setCapacity] = useState<CapacityData | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    fetch(`${API_BASE}/api/buddy/capacity`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCapacity(d))
      .catch(() => null)

    fetch(`${API_BASE}/api/buddy/profile`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setProfile(d))
      .catch(() => null)

    fetch(`${API_BASE}/api/v1/action-items`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data: Array<{ status: string; kind: string; start_time: string }> } | null) => {
        if (!body?.data) return
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)
        const tasks = body.data.filter((i) => {
          if (i.kind === 'break') return false
          const t = new Date(i.start_time)
          return t >= todayStart && t <= todayEnd
        })
        const done = tasks.filter(
          (i) => i.status === 'completed' || i.status === 'progress_70'
        ).length
        setTodayStats({ total: tasks.length, completed: done })
      })
      .catch(() => null)
  }, [])

  const achievementRate = capacity
    ? Math.round(capacity.achievement_rate * 100)
    : null

  const displayName = mounted ? (currentUser?.display_name ?? '') : ''

  return (
    <div className="container mx-auto px-3 sm:px-4 py-5 max-w-2xl">

      {/* グリーティング */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-0.5">おかえりなさい</p>
        <h1 className="text-xl font-semibold">
          {displayName ? `${displayName}さん` : 'ダッシュボード'}
        </h1>
      </div>

      {/* ステータスカード */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="p-1.5 bg-primary/12 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">達成率</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {achievementRate !== null ? `${achievementRate}%` : '—'}
            </p>
            {achievementRate !== null && (
              <Progress value={achievementRate} className="h-1 mt-2.5" />
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="p-1.5 bg-sky-500/12 rounded-lg">
                <Users className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <p className="text-xs text-muted-foreground">バディ</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {capacity !== null ? capacity.current_count : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {capacity !== null ? `/ ${capacity.max_count} 人` : '\u00a0'}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="p-1.5 bg-emerald-500/12 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-xs text-muted-foreground">今日</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {todayStats !== null ? todayStats.completed : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todayStats !== null ? `/ ${todayStats.total} 件` : '\u00a0'}
            </p>
          </div>
        </Card>
      </div>

      {/* 目標 */}
      {profile && profile.goal_types.length > 0 && (
        <Card className="mb-4">
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">設定中の目標</span>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-6 text-xs px-2 -mr-1">
                <Link href="/matching">編集</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.goal_types.map((goal) => (
                <span
                  key={goal}
                  className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {goal}
                </span>
              ))}
            </div>
            {profile.bio && (
              <p className="mt-2 text-xs text-muted-foreground">{profile.bio}</p>
            )}
          </div>
        </Card>
      )}

      {/* クイックアクション */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        クイックアクション
      </p>
      <div className="flex flex-col gap-2">
        <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
          <Link href="/matching" className="flex items-center gap-3 px-4 py-3.5">
            <div className="p-2 bg-primary/12 rounded-xl shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug">バディを探す</p>
              <p className="text-xs text-muted-foreground">目標が近い人とマッチング</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
          </Link>
        </Card>

        <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
          <Link href="/calendar" className="flex items-center gap-3 px-4 py-3.5">
            <div className="p-2 bg-emerald-500/12 rounded-xl shrink-0">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug">カレンダー</p>
              <p className="text-xs text-muted-foreground">Action Itemを管理する</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
          </Link>
        </Card>
      </div>

    </div>
  )
}
