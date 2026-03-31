'use client'
import { useBuddies } from '@/features/buddies/hooks/useBuddies'
import { BuddyCard } from '@/features/buddies/components/BuddyCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Buddies() {
  const router = useRouter()
  const { buddies, loading, error } = useBuddies()

  const handleOpenChat = (roomId: string) => {
    router.push(`/chat?room=${roomId}`)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">バディ・フレンド</h1>
          <p className="text-sm text-muted-foreground mt-0.5">一緒に目標達成を目指す仲間</p>
        </div>
        <Button size="sm" onClick={() => router.push('/matching')}>
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          バディを探す
        </Button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-4 text-sm text-muted-foreground">読み込み中...</div>
      )}

      <Tabs defaultValue="buddies">
        <TabsList className="grid w-full grid-cols-2 mb-5">
          <TabsTrigger value="buddies">バディ ({buddies.length})</TabsTrigger>
          <TabsTrigger value="friends">フレンド</TabsTrigger>
        </TabsList>

        <TabsContent value="buddies">
          {!loading && buddies.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 px-5">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">バディがいません</p>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  新しいバディを探して、一緒に目標達成を目指しましょう
                </p>
                <Button size="sm" onClick={() => router.push('/matching')}>
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  バディを探す
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buddies.map((buddy) => (
                <BuddyCard
                  key={buddy.id}
                  buddy={buddy}
                  onOpenChat={handleOpenChat}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="friends">
          <Card>
            <div className="flex flex-col items-center justify-center py-12 px-5">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">準備中</p>
              <p className="text-sm text-muted-foreground text-center">
                バディ期間を終えた相手とフレンドになる機能は近日公開予定です
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-5">
        <div className="px-4 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">バディ・フレンドについて</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">バディ：</span>
              マッチング後の1週間、互いのAction Itemを共有し、もくもく会を実施する相手です。
            </p>
            <p>
              <span className="font-medium text-foreground">フレンド：</span>
              バディ期間を終えた後、継続的に一緒に頑張りたい相手です。
            </p>
            <p className="text-xs mt-2">
              ※ 同時にバディになれる人数は、あなたの達成率に応じて増えます。
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
