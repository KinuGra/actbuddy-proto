// /matching ルートのエントリーポイント
// Matching Featureを呼び出すだけに留める
// Next.jsのApp Router用ページ（Server Component）
import { MatchingMain } from '@/features/matching'

export default function MatchingPage() {
  // サーバーコンポーネントとして動作。クライアント機能はMatchingMain側で必要に応じてuse client指定
  return (
    <main>
      <MatchingMain />
    </main>
  )
}
