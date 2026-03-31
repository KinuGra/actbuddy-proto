import Link from 'next/link'
import { CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { TodayTask, TaskActionItemStatus } from '../types'

interface TodayTasksWidgetProps {
  tasks: TodayTask[]
  totalCount: number
  loading: boolean
  onUpdateStatus: (id: string, status: TaskActionItemStatus) => Promise<void>
}

// --- 時刻フォーマット ---

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// --- ステータス関連 ---

const STATUS_BADGE: Record<
  TaskActionItemStatus,
  { label: string; className: string }
> = {
  not_started: { label: '未着手', className: 'bg-gray-100 text-gray-600' },
  progress_30: { label: '進行中', className: 'bg-blue-100 text-blue-700' },
  progress_70: { label: 'もうすぐ', className: 'bg-teal-100 text-teal-700' },
  completed: { label: '完了', className: 'bg-green-100 text-green-700' },
}

function isInProgress(status: TaskActionItemStatus): boolean {
  return status === 'progress_30' || status === 'progress_70'
}

// --- タスク行 ---

interface TaskRowProps {
  task: TodayTask
  /** true のとき: 別タスクが進行中のため、このタスクは折りたたみ表示 */
  subordinate: boolean
  onUpdateStatus: (id: string, status: TaskActionItemStatus) => Promise<void>
}

function TaskRow({ task, subordinate, onUpdateStatus }: TaskRowProps) {
  const badge = STATUS_BADGE[task.status]
  const done = task.status === 'completed'

  return (
    <li
      className={`flex items-center gap-3 py-3 px-1 border-b last:border-b-0 transition-opacity ${
        subordinate ? 'opacity-40' : ''
      }`}
    >
      {/* ステータスアイコン */}
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
      ) : isInProgress(task.status) ? (
        <PlayCircle className="w-5 h-5 text-blue-500 shrink-0" />
      ) : (
        <Circle className="w-5 h-5 text-gray-300 shrink-0" />
      )}

      {/* タイトル・時刻 */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${done ? 'line-through text-muted-foreground' : ''}`}
        >
          {task.title}
        </p>
        {!subordinate && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatTime(task.startTime)} – {formatTime(task.endTime)}
          </div>
        )}
      </div>

      {/* ステータスバッジ */}
      {!subordinate && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.className}`}>
          {badge.label}
        </span>
      )}

      {/* アクションボタン: 進行中タスクが存在するときは非表示 */}
      {!subordinate && !done && (
        <Button
          size="sm"
          variant={isInProgress(task.status) ? 'default' : 'outline'}
          className="shrink-0 text-xs"
          onClick={() =>
            onUpdateStatus(
              task.id,
              task.status === 'not_started' ? 'progress_30' : 'completed'
            )
          }
        >
          {task.status === 'not_started' ? '開始する' : '完了'}
        </Button>
      )}
    </li>
  )
}

// --- メインコンポーネント ---

export default function TodayTasksWidget({
  tasks,
  totalCount,
  loading,
  onUpdateStatus,
}: TodayTasksWidgetProps) {
  // Big3 の中で進行中タスクがあれば、他の未着手タスクを subordinate にする
  const activeTask = tasks.find((t) => isInProgress(t.status))

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">今日の Big 3</CardTitle>
          {totalCount > 3 && (
            <Link
              href="/calendar"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              全{totalCount}件を見る →
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3 py-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          // Empty state: CTAを第一要素に
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              今日取り組む3つのタスクを選びましょう
            </p>
            <Button asChild>
              <Link href="/calendar">今日のタスクを3つ選ぶ</Link>
            </Button>
          </div>
        ) : (
          <ul>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                subordinate={
                  // 進行中タスクが存在し、かつ自分が未着手のとき折りたたむ
                  !!activeTask &&
                  task.id !== activeTask.id &&
                  task.status === 'not_started'
                }
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
