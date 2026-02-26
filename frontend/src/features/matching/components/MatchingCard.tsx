// バディ候補ユーザーの情報表示カード
// user: バディ候補
// onAccept: バディになるボタン押下時
// onReject: スキップボタン押下時
import { User } from '../../users/types/user'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Target, Sparkles, TrendingUp } from 'lucide-react'

interface MatchingCardProps {
  user: User
  onAccept: () => void
  onReject: () => void
}

export function MatchingCard({ user, onAccept, onReject }: MatchingCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>
              {user.age}歳 |{' '}
              {user.gender === 'male'
                ? '男性'
                : user.gender === 'female'
                  ? '女性'
                  : 'その他'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">
              {user.achievementRate}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 目標 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">目標</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.goals.map((goal, index) => (
              <Badge key={index} variant="default">
                {goal}
              </Badge>
            ))}
          </div>
        </div>
        {/* 趣味 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-pink-500" />
            <h3 className="font-semibold">趣味</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.hobbies.map((hobby, index) => (
              <Badge key={index} variant="secondary">
                {hobby}
              </Badge>
            ))}
          </div>
        </div>
        {/* 興味・関心 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">興味・関心</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <Badge key={index} variant="outline">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
        {/* 達成率・バディ枠説明 */}
        <div className="bg-muted px-4 py-2 rounded-md text-sm text-muted-foreground">
          達成率 <span className="font-bold">{user.achievementRate}%</span>{' '}
          で、同時に <span className="font-bold">{user.buddyCount}人</span>{' '}
          までバディになれます。
        </div>
      </CardContent>
      <CardFooter className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onReject}>
          スキップ
        </Button>
        <Button onClick={onAccept}>バディになる</Button>
      </CardFooter>
    </Card>
  )
}
