import Link from 'next/link'
import { Users, MessageCircle, Share2, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Buddy } from '@/features/buddies/types/buddy'

interface BuddyWidgetProps {
  buddies: Buddy[]
  loading: boolean
}

interface BuddyRowProps {
  buddy: Buddy
}

function BuddyRow({ buddy }: BuddyRowProps) {
  return (
    <li className="flex items-center gap-3 py-3 border-b last:border-b-0">
      {/* アバター */}
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-primary">
          {buddy.partnerName.charAt(0)}
        </span>
      </div>

      {/* 名前 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{buddy.partnerName}</p>
        <p className="text-xs text-muted-foreground">バディ</p>
      </div>

      {/* 行動ボタン */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1"
          asChild
        >
          <Link href={buddy.roomId ? `/chat?roomId=${buddy.roomId}` : '/chat'}>
            <Share2 className="w-3 h-3" />
            進捗を共有
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1"
          asChild
        >
          <Link href={buddy.roomId ? `/chat?roomId=${buddy.roomId}` : '/chat'}>
            <MessageCircle className="w-3 h-3" />
            チャット
          </Link>
        </Button>
      </div>
    </li>
  )
}

export default function BuddyWidget({ buddies, loading }: BuddyWidgetProps) {
  const activeBuddies = buddies.filter((b) => b.status === 'active')

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-base">バディ</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3 py-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : activeBuddies.length === 0 ? (
          // Empty state: CTAを第一要素に
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              バディと一緒に目標を達成しましょう
            </p>
            <Button asChild variant="outline">
              <Link href="/matching" className="gap-2">
                <UserPlus className="w-4 h-4" />
                バディを招待する
              </Link>
            </Button>
          </div>
        ) : (
          <ul>
            {activeBuddies.map((buddy) => (
              <BuddyRow key={buddy.id} buddy={buddy} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
