import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">ActBuddy</h1>
        <p className="text-muted-foreground mt-1">
          行動を起こすきっかけを、一緒に。
        </p>
      </div>
      {children}
    </div>
  )
}
