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
