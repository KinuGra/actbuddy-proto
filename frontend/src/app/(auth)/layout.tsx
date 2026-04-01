import type { ReactNode } from 'react'
import { Users } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-2">

      {/* Left: Brand hero — desktop only */}
      <div className="hidden md:flex flex-col justify-between bg-primary p-12 text-primary-foreground overflow-hidden relative">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/8 rounded-full" />
        <div className="absolute bottom-20 -left-12 w-40 h-40 bg-white/6 rounded-full" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Users className="w-4.5 h-4.5" />
          </div>
          <span className="font-semibold tracking-tight">ActBuddy</span>
        </div>

        <div className="relative">
          <p className="text-3xl font-bold leading-snug mb-4">
            行動することを、<br />一人で諦めない。
          </p>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            目標を持つ仲間と出会い、<br />互いの行動を支え合う場所。
          </p>
        </div>

        <p className="relative text-xs text-primary-foreground/35">© 2025 ActBuddy</p>
      </div>

      {/* Right: Form area */}
      <div className="flex flex-col items-center justify-center min-h-screen md:min-h-0 px-6 py-12">
        {/* Mobile brand */}
        <div className="md:hidden mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-2xl shadow-md mb-3">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold">ActBuddy</h1>
          <p className="text-sm text-muted-foreground mt-0.5">行動を起こすきっかけを、一緒に。</p>
        </div>

        {children}
      </div>
    </div>
  )
}
