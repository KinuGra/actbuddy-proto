'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, Target, TrendingUp, ArrowRight } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* グリーティング */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            {displayName ? `こんにちは、${displayName}さん` : 'ダッシュボード'}
          </h1>
          <p className="text-muted-foreground">今日も一緒に目標に向かって進みましょう</p>
        </div>

        {/* ステータスカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 達成率 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">直近7日の達成率</p>
              </div>
              <p className="text-3xl font-bold mb-2">
                {achievementRate !== null ? `${achievementRate}%` : '—'}
              </p>
              {achievementRate !== null && (
                <Progress value={achievementRate} className="h-2" />
              )}
            </CardContent>
          </Card>

          {/* バディ枠 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">バディ</p>
              </div>
              <p className="text-3xl font-bold mb-1">
                {capacity !== null
                  ? `${capacity.current_count} / ${capacity.max_count}`
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {capacity !== null ? `上限 ${capacity.max_count}人` : '読み込み中...'}
              </p>
            </CardContent>
          </Card>

          {/* 今日のAction Item */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">今日のタスク</p>
              </div>
              <p className="text-3xl font-bold mb-1">
                {todayStats !== null
                  ? `${todayStats.completed} / ${todayStats.total}`
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {todayStats !== null
                  ? `${todayStats.total}件中${todayStats.completed}件完了`
                  : '読み込み中...'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 目標 */}
        {profile && profile.goal_types.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">設定中の目標</CardTitle>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/matching" className="flex items-center gap-1 text-xs">
                    プロフィールを編集
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.goal_types.map((goal) => (
                  <span
                    key={goal}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {goal}
                  </span>
                ))}
              </div>
              {profile.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/matching">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-base">バディを探す</CardTitle>
                      <CardDescription>目標が近い人とマッチング</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/calendar">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-base">カレンダー</CardTitle>
                      <CardDescription>Action Itemを管理する</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
