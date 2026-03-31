'use client'

import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useBuddies } from '@/features/buddies/hooks/useBuddies'
import { useDashboard } from '../hooks/useDashboard'
import DashboardGreeting from './DashboardGreeting'
import StatsSection from './StatsSection'
import TodayTasksWidget from './TodayTasksWidget'
import GoalBadges from './GoalBadges'
import BuddyWidget from './BuddyWidget'
import QuickActions from './QuickActions'

export default function HomeMain() {
  const { user: currentUser } = useCurrentUser()
  const { capacity, profile, big3, todayStats, loading, updateTaskStatus } = useDashboard()
  const { buddies, loading: buddiesLoading } = useBuddies()

  // useCurrentUser は useEffect で非同期フェッチするため、
  // サーバー・クライアント双方の初期値が null で一致しており hydration mismatch は発生しない
  const displayName = currentUser?.display_name ?? ''

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <DashboardGreeting displayName={displayName} todayStats={todayStats} />

        <StatsSection capacity={capacity} todayStats={todayStats} loading={loading} />

        <TodayTasksWidget
          tasks={big3}
          totalCount={todayStats.total}
          loading={loading}
          onUpdateStatus={updateTaskStatus}
        />

        {profile && profile.goalTypes.length > 0 && (
          <GoalBadges goalTypes={profile.goalTypes} bio={profile.bio} />
        )}

        <BuddyWidget buddies={buddies} loading={buddiesLoading} />

        <QuickActions />
      </div>
    </div>
  )
}
