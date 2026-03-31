'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, MessageSquare, UserX } from 'lucide-react'
import { useMatching } from '../hooks/useMatching'
import { useBuddyProfile } from '../hooks/useBuddyProfile'
import { BuddyProfileForm } from './BuddyProfileForm'

export default function MatchingMain() {
  const router = useRouter()
  const { profile, loading: profileLoading, upsertProfile } = useBuddyProfile()
  const { queueStatus, relationships, capacity, loading: matchLoading, joinQueue, leaveQueue, endRelationship } =
    useMatching()

  const [actionError, setActionError] = useState<string | null>(null)
  const [showProfileForm, setShowProfileForm] = useState(false)

  const loading = profileLoading || matchLoading

  const handleJoinQueue = async () => {
    setActionError(null)
    try {
      await joinQueue()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  const handleLeaveQueue = async () => {
    setActionError(null)
    try {
      await leaveQueue()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  const handleEndRelationship = async (id: string) => {
    if (!confirm('バディ関係を終了しますか？')) return
    try {
      await endRelationship(id)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
        読み込み中...
      </div>
    )
  }

  const inQueue = queueStatus?.in_queue && queueStatus.status === 'waiting'

  return (
    <div className="container mx-auto px-4 py-6 max-w-xl space-y-5">

      <div>
        <h1 className="text-xl font-semibold">バディを探す</h1>
        <p className="text-sm text-muted-foreground mt-0.5">目標や活動時間が近い人と自動でマッチングします</p>
      </div>

      {actionError && (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
          {actionError}
        </div>
      )}

      {/* バディ上限 */}
      {capacity && (
        <Card>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">現在のバディ数</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold tabular-nums">{capacity.current_count}</span>
              <span className="text-muted-foreground text-sm"> / {capacity.max_count} 人</span>
              <p className="text-xs text-muted-foreground">
                達成率 {Math.round(capacity.achievement_rate * 100)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* プロフィール設定 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">プロフィール</p>
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setShowProfileForm((v) => !v)}>
            {showProfileForm ? '閉じる' : profile ? '編集' : '設定する'}
          </Button>
        </div>

        {!profile && !showProfileForm && (
          <Card>
            <div className="px-4 py-4 text-center text-sm text-muted-foreground">
              マッチングに参加するにはプロフィールを設定してください
            </div>
          </Card>
        )}

        {profile && !showProfileForm && (
          <Card>
            <div className="px-4 py-3.5 space-y-2.5">
              {profile.bio && <p className="text-sm">{profile.bio}</p>}
              <div className="flex flex-wrap gap-1">
                {profile.goal_types.map((g) => (
                  <Badge key={g} variant="default" className="text-xs">{g}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.active_times.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          </Card>
        )}

        {showProfileForm && (
          <BuddyProfileForm
            initialProfile={profile}
            onSave={async (req) => {
              await upsertProfile(req)
              setShowProfileForm(false)
            }}
          />
        )}
      </div>

      {/* キュー操作 */}
      {profile && (
        <Card>
          <div className="flex flex-col items-center px-4 py-6 gap-3">
            {inQueue ? (
              <>
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">マッチング待機中</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  バディが見つかると通知でお知らせします
                  {queueStatus?.expires_at && (
                    <span className="block mt-0.5">
                      有効期限: {new Date(queueStatus.expires_at).toLocaleDateString('ja-JP')}
                    </span>
                  )}
                </p>
                <Button variant="outline" size="sm" onClick={handleLeaveQueue}>
                  キャンセル
                </Button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  マッチングキューに参加すると、1時間ごとに自動でバディを探します
                </p>
                <Button
                  onClick={handleJoinQueue}
                  disabled={!capacity || capacity.current_count >= capacity.max_count}
                >
                  マッチングに参加する
                </Button>
                {capacity && capacity.current_count >= capacity.max_count && (
                  <p className="text-xs text-muted-foreground">バディの上限数に達しています</p>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {/* アクティブなバディ一覧 */}
      {relationships.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">現在のバディ</p>
          <div className="flex flex-col gap-2">
            {relationships.map((rel) => (
              <Card key={rel.id}>
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                      {rel.partner.display_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rel.partner.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(rel.ends_at).toLocaleDateString('ja-JP')} まで
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => router.push(`/chat?room=${rel.room_id}`)}
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      チャット
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleEndRelationship(rel.id)}
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
