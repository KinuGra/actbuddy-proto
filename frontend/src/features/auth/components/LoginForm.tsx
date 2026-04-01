'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const router = useRouter()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = await login({ email, password })
    if (user) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">おかえりなさい</h1>
        <p className="text-sm text-muted-foreground mt-1">アカウントにログインしてください</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

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
            placeholder="パスワードを入力"
            required
            autoComplete="current-password"
            className="h-11"
          />
        </div>

        <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
          {loading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        アカウントをお持ちでない方は{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  )
}
