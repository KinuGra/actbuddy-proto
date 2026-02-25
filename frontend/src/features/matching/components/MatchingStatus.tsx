// マッチング状態表示用コンポーネント
// status: マッチング状態
import { MatchingStatus } from '../types/matching'
import { Loader2, Search, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface MatchingStatusProps {
  status: MatchingStatus
}

export function MatchingStatusDisplay({ status }: MatchingStatusProps) {
  if (status === 'searching') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h2 className="text-2xl font-semibold">マッチング中...</h2>
          <p className="text-muted-foreground text-center">
            あなたに最適なバディを探しています。
            <br />
            しばらくお待ちください。
          </p>
        </CardContent>
      </Card>
    )
  }

  if (status === 'matched') {
    return (
      <Card className="w-full max-w-2xl mx-auto mb-6">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          <div>
            <h3 className="font-semibold">マッチング成立！</h3>
            <p className="text-sm text-muted-foreground">
              あなたに合ったバディが見つかりました
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
