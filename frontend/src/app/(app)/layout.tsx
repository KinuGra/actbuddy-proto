// (app)配下のレイアウト。アプリ本体の共通UIをここで定義
import type { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {/* ここにSidebarやAppBarなどを配置可能 */}
      {children}
    </section>
  )
}
