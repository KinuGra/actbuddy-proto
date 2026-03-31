import Link from 'next/link'
import { Users, CalendarPlus, MessageCircle, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface QuickActionItem {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}

const ACTIONS: QuickActionItem[] = [
  {
    href: '/matching',
    icon: <Users className="w-8 h-8 text-primary" />,
    title: 'バディを探す',
    description: '目標が近い人とマッチング',
  },
  {
    href: '/calendar',
    icon: <CalendarPlus className="w-8 h-8 text-green-500" />,
    title: '今日のタスクを追加',
    description: 'カレンダーでAction Itemを管理',
  },
  {
    href: '/chat',
    icon: <MessageCircle className="w-8 h-8 text-blue-500" />,
    title: 'チャット',
    description: 'バディと進捗を共有する',
  },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ACTIONS.map((action) => (
        <Card
          key={action.href}
          className="hover:shadow-md transition-shadow cursor-pointer"
        >
          <Link href={action.href}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {action.icon}
                  <div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}
