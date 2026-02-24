// dashboardページのエントリーポイント
// Home Featureを呼び出すだけに留める
// Next.jsのApp Router用ページ（Server Component）
import { HomeMain } from '@/features/home'

export default function DashboardPage() {
  // サーバーコンポーネントとして動作。クライアント機能はHomeMain側で必要に応じてuse client指定
  return (
    <main>
      <HomeMain />
    </main>
  )
}
