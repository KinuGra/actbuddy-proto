'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '../hooks/useAuth'

export function SignupForm() {
  const router = useRouter()
  const { signup, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = await signup({ email, password, display_name: displayName })
    if (user) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">アカウントを作成</h1>
        <p className="text-sm text-muted-foreground mt-1">行動を始める仲間と出会いましょう</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-sm font-medium">表示名</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="あなたの名前"
            required
            autoComplete="name"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            autoComplete="email"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">パスワード</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8文字以上のパスワード"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-11"
          />
        </div>

        <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
          {loading ? '登録中...' : 'アカウントを作成'}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
