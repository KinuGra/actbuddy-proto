// Home画面のメインUI（Next.js用）
// 既存React実装を忠実に移植。App Router(Server Component)で動作。
// クライアント機能が必要な場合は"use client"を先頭に追加してください。
import {
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Target,
  TrendingUp,
} from 'lucide-react'
import { currentUser } from '../../users/mocks/mockUsers'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomeMain() {
  // Home画面のUI構成。バディの達成率・目標・機能紹介などを表示
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヒーローセクション */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          バディと一緒に目標を達成しよう
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          環境的強制力×Action itemで、行動開始率を上げる
        </p>
        <Button size="lg" asChild>
          <Link href="/matching">
            <Users className="mr-2 h-5 w-5" />
            バディを探す
          </Link>
        </Button>
      </div>

      {/* 現在のステータス */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>あなたのステータス</CardTitle>
          <CardDescription>現在の達成率とバディ状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">達成率</p>
                <p className="text-2xl font-bold">
                  {currentUser.achievementRate}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">バディ枠</p>
                <p className="text-2xl font-bold">{currentUser.buddyCount}人</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">目標数</p>
                <p className="text-2xl font-bold">
                  {currentUser.goals.length}個
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 機能紹介 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <Users className="w-10 h-10 text-primary mb-2" />
            <CardTitle>マッチング</CardTitle>
            <CardDescription>目標が近い人と自動でマッチング</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Calendar className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Action Item</CardTitle>
            <CardDescription>毎日のタスクを管理・公開</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <MessageSquare className="w-10 h-10 text-primary mb-2" />
            <CardTitle>チャット</CardTitle>
            <CardDescription>バディと日程調整・相談</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Bell className="w-10 h-10 text-primary mb-2" />
            <CardTitle>通知</CardTitle>
            <CardDescription>毎日の入力を促すリマインド</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* あなたの目標 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>あなたの目標</CardTitle>
          <CardDescription>現在設定されている目標</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {currentUser.goals.map((goal, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
