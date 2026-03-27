'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, CheckCircle, UserX } from 'lucide-react'
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
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        読み込み中...
      </div>
    )
  }

  const inQueue = queueStatus?.in_queue && queueStatus.status === 'waiting'

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">バディを探す</h1>
        <p className="text-muted-foreground">目標や活動時間が近い人と自動でマッチングします</p>
      </div>

      {actionError && (
        <div className="max-w-2xl mx-auto bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm">
          {actionError}
        </div>
      )}

      {/* バディ上限 */}
      {capacity && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">現在のバディ数</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">{capacity.current_count}</span>
              <span className="text-muted-foreground"> / {capacity.max_count} 人</span>
              <p className="text-xs text-muted-foreground">
                達成率 {Math.round(capacity.achievement_rate * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* プロフィール設定 */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">プロフィール</h2>
          <Button variant="outline" size="sm" onClick={() => setShowProfileForm((v) => !v)}>
            {showProfileForm ? '閉じる' : profile ? '編集' : '設定する'}
          </Button>
        </div>

        {!profile && !showProfileForm && (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              マッチングに参加するにはプロフィールを設定してください
            </CardContent>
          </Card>
        )}

        {profile && !showProfileForm && (
          <Card>
            <CardContent className="py-4 space-y-3">
              {profile.bio && <p className="text-sm">{profile.bio}</p>}
              <div className="flex flex-wrap gap-1">
                {profile.goal_types.map((g) => (
                  <Badge key={g} variant="default">{g}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.active_times.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </CardContent>
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
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center py-8 space-y-4">
              {inQueue ? (
                <>
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="w-6 h-6 animate-pulse" />
                    <span className="font-semibold text-lg">マッチング待機中</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    バディが見つかると通知でお知らせします
                    {queueStatus?.expires_at && (
                      <span className="block">
                        有効期限: {new Date(queueStatus.expires_at).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </p>
                  <Button variant="outline" onClick={handleLeaveQueue}>
                    キャンセル
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* アクティブなバディ一覧 */}
      {relationships.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-lg font-semibold">現在のバディ</h2>
          {relationships.map((rel) => (
            <Card key={rel.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {rel.partner.display_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{rel.partner.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      終了: {new Date(rel.ends_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/chat?room=${rel.room_id}`)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    チャット
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleEndRelationship(rel.id)}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
