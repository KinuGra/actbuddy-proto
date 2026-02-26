'use client'

// マッチング画面のメインUI（Next.js用）
// 既存React実装を忠実に移植。App Router(Server Component)で動作。
// マッチング状態管理やバディ候補表示などを担当
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useMatching } from '../hooks/useMatching'
import { MatchingCard } from './MatchingCard'
import { MatchingStatusDisplay } from './MatchingStatus'
import { Users, Info, CheckCircle } from 'lucide-react'
import { currentUser } from '../../users/mocks/mockUsers'

export default function MatchingMain() {
  // useMatching: マッチング状態管理用カスタムフック
  const {
    matchingState,
    startMatching,
    cancelMatching,
    acceptMatch,
    rejectMatch,
  } = useMatching()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ページヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">バディを探す</h1>
        <p className="text-muted-foreground">
          あなたに最適なバディをマッチングします
        </p>
      </div>
      {/* バディ情報カード */}
      <Card className="mb-8 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            バディについて
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-semibold">マッチング後1週間の期間</p>
              <p className="text-sm text-muted-foreground">
                1週間のバディ期間中、互いのAction itemを共有し、もくもく会を実施
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-semibold">同時にバディになれる人数</p>
              <p className="text-sm text-muted-foreground">
                現在{' '}
                <span className="font-bold text-primary">
                  {currentUser.buddyCount}人
                </span>{' '}
                まで（達成率が上がると増えます）
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-semibold">マッチングアルゴリズム</p>
              <p className="text-sm text-muted-foreground">
                目標、趣味、興味が近い人を自動でマッチング
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* マッチング状態表示 */}
      {matchingState.status === 'idle' && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">バディを探しましょう</h2>
              <p className="text-muted-foreground text-center max-w-md">
                ボタンを押すと、あなたの目標や興味に合ったバディを自動でマッチングします
              </p>
              <Button size="lg" onClick={startMatching} className="mt-4">
                <Users className="mr-2 h-5 w-5" />
                マッチングを開始
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {matchingState.status === 'searching' && (
        <div className="space-y-4">
          <MatchingStatusDisplay status={matchingState.status} />
          <div className="text-center">
            <Button variant="outline" onClick={cancelMatching}>
              キャンセル
            </Button>
          </div>
        </div>
      )}
      {matchingState.status === 'matched' && matchingState.matchedUser && (
        <div className="space-y-4">
          <MatchingStatusDisplay status={matchingState.status} />
          <MatchingCard
            user={matchingState.matchedUser}
            onAccept={acceptMatch}
            onReject={rejectMatch}
          />
        </div>
      )}
      {matchingState.status === 'in-buddy' && matchingState.matchedUser && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold">バディになりました！</h2>
              <p className="text-muted-foreground text-center max-w-md">
                {matchingState.matchedUser.name}
                さんとのバディ関係が開始されました。
                <br />
                これから1週間、一緒に頑張りましょう！
              </p>
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/')}
                >
                  ホームに戻る
                </Button>
                <Button>チャットを開始</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
