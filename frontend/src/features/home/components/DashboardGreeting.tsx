import type { TodayStats } from '../types'

interface DashboardGreetingProps {
  displayName: string
  todayStats: TodayStats
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'おはようございます'
  if (hour >= 12 && hour < 18) return 'こんにちは'
  return 'こんばんは'
}

function formatDate(date: Date): string {
  const DAYS = ['日', '月', '火', '水', '木', '金', '土']
  const m = date.getMonth() + 1
  const d = date.getDate()
  const dow = DAYS[date.getDay()]
  return `${m}月${d}日（${dow}）`
}

function buildStatusSummary(stats: TodayStats): string {
  if (stats.total === 0) return '今日のタスクはまだありません'
  if (stats.completed === stats.total) return `今日のタスク${stats.total}件、すべて完了`
  return `今日: タスク${stats.total}件 · ${stats.completed}件完了`
}

export default function DashboardGreeting({
  displayName,
  todayStats,
}: DashboardGreetingProps) {
  const today = new Date()

  return (
    <div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">
          {displayName ? `${getGreeting()}、${displayName}さん` : 'ダッシュボード'}
        </h1>
        <span className="text-sm text-muted-foreground">{formatDate(today)}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{buildStatusSummary(todayStats)}</p>
    </div>
  )
}
