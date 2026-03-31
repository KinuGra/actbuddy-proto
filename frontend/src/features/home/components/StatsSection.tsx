import Link from 'next/link'
import { TrendingUp, Users, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { DashboardCapacity, TodayStats } from '../types'

interface StatsSectionProps {
  capacity: DashboardCapacity | null
  todayStats: TodayStats
  loading: boolean
}

// --- 達成率カード ---

type RateLevel = 'low' | 'mid' | 'high'

function getRateLevel(rate: number): RateLevel {
  if (rate <= 30) return 'low'
  if (rate <= 70) return 'mid'
  return 'high'
}

const RATE_LABEL: Record<RateLevel, string> = { low: '低', mid: '中', high: '高' }
const RATE_COLOR: Record<RateLevel, string> = {
  low: 'text-red-500',
  mid: 'text-yellow-500',
  high: 'text-green-600',
}
const PROGRESS_COLOR: Record<RateLevel, string> = {
  low: '[&>div]:bg-red-500',
  mid: '[&>div]:bg-yellow-500',
  high: '[&>div]:bg-green-600',
}

function AchievementCard({ capacity }: { capacity: DashboardCapacity | null }) {
  const rate = capacity ? Math.round(capacity.achievementRate * 100) : null
  const level = rate !== null ? getRateLevel(rate) : null

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">直近7日の達成率</p>
        </div>

        {rate !== null && level !== null ? (
          <>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-3xl font-bold">{rate}%</p>
              <span className={`text-xs font-medium ${RATE_COLOR[level]}`}>
                {RATE_LABEL[level]}
              </span>
            </div>
            <Progress value={rate} className={`h-2 ${PROGRESS_COLOR[level]}`} />
            <p className="mt-2 text-xs text-muted-foreground">完了タスク / 直近7日の全タスク</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            タスクを1つ完了すると記録が始まります
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// --- バディカード ---

function BuddyCard({ capacity }: { capacity: DashboardCapacity | null }) {
  const isEmpty = capacity !== null && capacity.currentCount === 0
  const isFull = capacity !== null && capacity.currentCount >= capacity.maxCount

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-muted-foreground">バディ</p>
        </div>

        {capacity !== null ? (
          <>
            <p className="text-3xl font-bold mb-1">
              {capacity.currentCount} / {capacity.maxCount}
            </p>
            {isEmpty ? (
              <Button variant="outline" size="sm" asChild className="mt-2">
                <Link href="/matching">バディを探す</Link>
              </Button>
            ) : isFull ? (
              <p className="text-xs text-muted-foreground">上限に達しています</p>
            ) : (
              <p className="text-xs text-muted-foreground">上限 {capacity.maxCount}人</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">読み込み中...</p>
        )}
      </CardContent>
    </Card>
  )
}

// --- 今日のタスクカード ---

function TodayTasksCard({ todayStats, loading }: { todayStats: TodayStats; loading: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Calendar className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground">今日のタスク</p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground mt-2">読み込み中...</p>
        ) : todayStats.total === 0 ? (
          <>
            <p className="text-3xl font-bold mb-2">0 / 0</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/calendar">今日のタスクを3つ選ぶ</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold mb-1">
              {todayStats.completed} / {todayStats.total}
            </p>
            <p className="text-xs text-muted-foreground">
              {todayStats.total}件中{todayStats.completed}件完了
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// --- 公開コンポーネント ---

export default function StatsSection({ capacity, todayStats, loading }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AchievementCard capacity={capacity} />
      <BuddyCard capacity={capacity} />
      <TodayTasksCard todayStats={todayStats} loading={loading} />
    </div>
  )
}
