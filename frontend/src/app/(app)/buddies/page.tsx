'use client'
import { useBuddies } from '@/features/buddies/hooks/useBuddies'
import { BuddyCard } from '@/features/buddies/components/BuddyCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">バディ・フレンド</h1>
          <Button onClick={() => router.push('/matching')}>
            <UserPlus className="w-4 h-4 mr-2" />
            新しいバディを探す
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 p-3 text-sm text-muted-foreground">
            読み込み中...
          </div>
        )}

        <Tabs defaultValue="buddies">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="buddies">バディ ({buddies.length})</TabsTrigger>
            <TabsTrigger value="friends">フレンド</TabsTrigger>
          </TabsList>

          <TabsContent value="buddies">
            {!loading && buddies.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">バディがいません</h3>
                  <p className="text-muted-foreground mb-6 text-center">
                    新しいバディを探して、一緒に目標達成を目指しましょう
                  </p>
                  <Button onClick={() => router.push('/matching')}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    バディを探す
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">準備中</h3>
                <p className="text-muted-foreground text-center">
                  バディ期間を終えた相手とフレンドになる機能は近日公開予定です
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardContent className="py-6">
            <h3 className="font-semibold mb-3">バディ・フレンドについて</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">バディ：</span>
                マッチング後の1週間、互いのAction Itemを共有し、もくもく会を実施する相手です。
              </p>
              <p>
                <span className="font-semibold text-foreground">フレンド：</span>
                バディ期間を終えた後、継続的に一緒に頑張りたい相手です。
              </p>
              <p className="mt-3 text-xs">
                ※ 同時にバディになれる人数は、あなたの達成率に応じて増えます。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
