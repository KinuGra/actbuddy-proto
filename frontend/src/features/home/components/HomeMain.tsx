'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, Target, TrendingUp, ChevronRight, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  const achievementRate = capacity ? Math.round(capacity.achievement_rate * 100) : null
  const displayName = mounted ? (currentUser?.display_name ?? '') : ''

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* グリーティング */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-0.5">おかえりなさい</p>
        <h1 className="text-xl font-semibold tracking-tight">
          {displayName ? `${displayName}さん` : 'ダッシュボード'}
        </h1>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">

        {/* Hero: 達成率 — spans 2 cols on md */}
        <Card className="md:col-span-2 relative overflow-hidden bg-primary text-primary-foreground border-0 shadow-none">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/8 rounded-full pointer-events-none" />
          <div className="absolute bottom-2 -left-6 w-20 h-20 bg-white/6 rounded-full pointer-events-none" />
          <div className="relative p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-primary-foreground/70" />
              <p className="text-xs text-primary-foreground/70">達成率</p>
            </div>
            <p className="text-5xl font-bold tabular-nums tracking-tight leading-none mb-1">
              {achievementRate !== null ? achievementRate : '—'}
              {achievementRate !== null && <span className="text-2xl font-semibold ml-0.5">%</span>}
            </p>
            <p className="text-xs text-primary-foreground/60 mt-2">
              {achievementRate !== null
                ? achievementRate >= 80
                  ? '素晴らしい進捗です'
                  : achievementRate >= 50
                  ? '順調に進んでいます'
                  : 'もう一頑張り！'
                : 'データを読み込み中'}
            </p>
          </div>
        </Card>

        {/* バディ数 */}
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="p-1.5 bg-sky-500/10 rounded-lg">
                <Users className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <p className="text-xs text-muted-foreground">バディ</p>
            </div>
            <p className="text-3xl font-bold tabular-nums tracking-tight">
              {capacity !== null ? capacity.current_count : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {capacity !== null ? `/ ${capacity.max_count} 人` : '\u00a0'}
            </p>
          </div>
        </Card>

        {/* 今日のタスク */}
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-xs text-muted-foreground">今日</p>
            </div>
            <p className="text-3xl font-bold tabular-nums tracking-tight">
              {todayStats !== null ? todayStats.completed : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {todayStats !== null ? `/ ${todayStats.total} 件完了` : '\u00a0'}
            </p>
          </div>
        </Card>

        {/* 目標タグ */}
        <Card className="col-span-2 md:col-span-1">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Target className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">目標</p>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-6 text-xs px-2 -mr-1">
                <Link href="/matching">編集</Link>
              </Button>
            </div>
            {profile && profile.goal_types.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.goal_types.map((goal) => (
                  <span
                    key={goal}
                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">目標が未設定です</p>
            )}
          </div>
        </Card>
      </div>

      {/* クイックアクション */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        クイックアクション
      </p>
      <div className="flex flex-col gap-1.5">
        <Card className="hover:bg-secondary/60 transition-colors cursor-pointer">
          <Link href="/matching" className="flex items-center gap-3 px-4 py-3.5">
            <div className="p-2 bg-primary/10 rounded-xl shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug">バディを探す</p>
              <p className="text-xs text-muted-foreground">目標が近い人とマッチング</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          </Link>
        </Card>

        <Card className="hover:bg-secondary/60 transition-colors cursor-pointer">
          <Link href="/calendar" className="flex items-center gap-3 px-4 py-3.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl shrink-0">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug">カレンダー</p>
              <p className="text-xs text-muted-foreground">Action Itemを管理する</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          </Link>
        </Card>

        <Card className="hover:bg-secondary/60 transition-colors cursor-pointer">
          <Link href="/chat" className="flex items-center gap-3 px-4 py-3.5">
            <div className="p-2 bg-amber-500/10 rounded-xl shrink-0">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug">チャット</p>
              <p className="text-xs text-muted-foreground">バディとメッセージ</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          </Link>
        </Card>
      </div>
    </div>
  )
}
