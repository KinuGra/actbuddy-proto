'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { Settings, User, Mail, Save, Loader2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export default function SettingsMain() {
  const { user: currentUser, refresh } = useCurrentUser()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.display_name)
      setEmail(currentUser.email)
    }
  }, [currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: displayName,
          email: email,
        }),
        credentials: 'include',
      })

      if (res.ok) {
        setMessage({ type: 'success', text: '設定を更新しました。' })
        refresh()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || '更新に失敗しました。' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました。' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-5">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">設定</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>アカウント情報</CardTitle>
              <CardDescription>
                表示名やメールアドレスを変更できます。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message && (
                <div
                  className={`p-4 rounded-md text-sm ${
                    message.type === 'success'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-red-500/10 text-red-600'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="display_name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  表示名
                </Label>
                <Input
                  id="display_name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ユーザー名を入力してください"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                変更を保存
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
