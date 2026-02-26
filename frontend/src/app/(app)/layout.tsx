// (app)配下のレイアウト。アプリ本体の共通UIをここで定義
import { Header } from '@/components/layouts/Header'
import type { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      <Header />
      {children}
    </section>
  )
}
