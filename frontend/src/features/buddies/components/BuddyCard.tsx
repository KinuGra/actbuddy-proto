import { Buddy } from '../types/buddy'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MessageSquare, Calendar, TrendingUp, Heart } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface BuddyCardProps {
  buddy: Buddy
  onBecomeFriend?: (buddyId: string) => void
  onOpenChat?: (userId: string) => void
}

export function BuddyCard({
  buddy,
  onBecomeFriend,
  onOpenChat,
}: BuddyCardProps) {
  const daysRemaining = differenceInDays(buddy.endDate, new Date())
  const totalDays = differenceInDays(buddy.endDate, buddy.startDate)
  const progress = Math.max(
    0,
    Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)
  )

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">{buddy.user.name}</h3>
              <Badge
                variant={
                  buddy.relationType === 'buddy' ? 'default' : 'secondary'
                }
              >
                {buddy.relationType === 'buddy' ? 'バディ' : 'フレンド'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {buddy.user.age}歳 |{' '}
              {buddy.user.gender === 'male'
                ? '男性'
                : buddy.user.gender === 'female'
                  ? '女性'
                  : 'その他'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-semibold">{buddy.user.achievementRate}%</span>
          </div>
        </div>

        {buddy.relationType === 'buddy' && buddy.status === 'active' && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">バディ期間の進捗</span>
              <span className="font-medium">残り {daysRemaining}日</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">目標</p>
            <div className="flex flex-wrap gap-2">
              {buddy.user.goals.slice(0, 3).map((goal, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {format(buddy.startDate, 'yyyy/MM/dd')} -{' '}
              {format(buddy.endDate, 'yyyy/MM/dd')}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onOpenChat?.(buddy.user.id)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          チャット
        </Button>
        {buddy.canBecomeFriend && onBecomeFriend && (
          <Button className="flex-1" onClick={() => onBecomeFriend(buddy.id)}>
            <Heart className="w-4 h-4 mr-2" />
            フレンドになる
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
