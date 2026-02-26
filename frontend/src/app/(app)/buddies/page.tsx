'use client'
import { useState } from 'react'
import { mockBuddies, mockFriends } from '@/features/buddies/mocks/mockBuddies'
import { BuddyCard } from '@/features/buddies/components/BuddyCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function Buddies() {
  const router = useRouter()
  const [buddies, setBuddies] = useState(mockBuddies)
  const [friends, setFriends] = useState(mockFriends)

  const handleBecomeFriend = (buddyId: string) => {
    const buddy = buddies.find((b) => b.id === buddyId)
    if (buddy) {
      // バディリストから削除
      setBuddies((prev) => prev.filter((b) => b.id !== buddyId))

      // フレンドリストに追加
      setFriends((prev) => [
        ...prev,
        {
          ...buddy,
          status: 'completed',
          relationType: 'friend',
          canBecomeFriend: false,
        },
      ])

      toast.success(`${buddy.user.name}さんとフレンドになりました！`)
    }
  }

  const handleOpenChat = (userId: string) => {
    router.push('/chat')
    toast.info('チャット画面に移動しました')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">バディ・フレンド</h1>
          <Button onClick={() => router.push('/matching')}>
            <UserPlus className="w-4 h-4 mr-2" />
            新しいバディを探す
          </Button>
        </div>

        {/* タブ */}
        <Tabs defaultValue="buddies">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="buddies">バディ ({buddies.length})</TabsTrigger>
            <TabsTrigger value="friends">
              フレンド ({friends.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buddies">
            {buddies.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    バディがいません
                  </h3>
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
                    onBecomeFriend={handleBecomeFriend}
                    onOpenChat={handleOpenChat}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="friends">
            {friends.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Users className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    フレンドがいません
                  </h3>
                  <p className="text-muted-foreground text-center">
                    バディ期間を終えた相手とフレンドになると、
                    <br />
                    継続的に一緒に目標達成を目指せます
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((friend) => (
                  <BuddyCard
                    key={friend.id}
                    buddy={friend}
                    onOpenChat={handleOpenChat}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 説明カード */}
        <Card className="mt-8">
          <CardContent className="py-6">
            <h3 className="font-semibold mb-3">バディ・フレンドについて</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">バディ：</span>
                マッチング後の1週間、互いのAction
                Itemを共有し、もくもく会を実施する相手です。
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  フレンド：
                </span>
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
