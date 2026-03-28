import { Buddy } from '../types/buddy'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MessageSquare, Calendar } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface BuddyCardProps {
  buddy: Buddy
  onOpenChat?: (roomId: string) => void
}

export function BuddyCard({ buddy, onOpenChat }: BuddyCardProps) {
  const now = new Date()
  const daysRemaining = Math.max(0, differenceInDays(buddy.endDate, now))
  const totalDays = differenceInDays(buddy.endDate, buddy.startDate)
  const elapsed = totalDays - daysRemaining
  const progress = totalDays > 0 ? Math.min(100, (elapsed / totalDays) * 100) : 100

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">{buddy.partnerName}</h3>
              <Badge variant={buddy.relationType === 'buddy' ? 'default' : 'secondary'}>
                {buddy.relationType === 'buddy' ? 'バディ' : 'フレンド'}
              </Badge>
            </div>
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

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {format(buddy.startDate, 'yyyy/MM/dd')} -{' '}
            {format(buddy.endDate, 'yyyy/MM/dd')}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => buddy.roomId && onOpenChat?.(buddy.roomId)}
          disabled={!buddy.roomId}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          チャット
        </Button>
      </CardFooter>
    </Card>
  )
}
