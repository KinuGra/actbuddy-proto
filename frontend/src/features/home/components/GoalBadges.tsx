import Link from 'next/link'
import { Target, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface GoalBadgesProps {
  goalTypes: string[]
  bio?: string
}

export default function GoalBadges({ goalTypes, bio }: GoalBadgesProps) {
  if (goalTypes.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">設定中の目標</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/matching" className="flex items-center gap-1 text-xs">
              プロフィールを編集
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {goalTypes.map((goal) => (
            <span
              key={goal}
              className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
            >
              {goal}
            </span>
          ))}
        </div>
        {bio && <p className="mt-3 text-sm text-muted-foreground">{bio}</p>}
      </CardContent>
    </Card>
  )
}
