import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'

const schema = z
  .object({
    title: z.string().min(1, 'タイトルは必須です'),
    description: z.string().optional(),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, '時刻形式が正しくありません（HH:mm）'),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, '時刻形式が正しくありません（HH:mm）'),
  })
  .superRefine((data, ctx) => {
    const [startHour, startMinute] = data.startTime.split(':').map(Number)
    const [endHour, endMinute] = data.endTime.split(':').map(Number)

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    if (endTotalMinutes <= startTotalMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '終了時刻は開始時刻より後にしてください',
        path: ['endTime'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

function toTimeString(date: Date) {
  return format(date, 'HH:mm')
}

function hasNonMidnightTime(date: Date) {
  return date.getHours() !== 0 || date.getMinutes() !== 0
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toTotalMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

interface AddActionItemDialogProps {
  selectedDate: Date
  slotEnd?: Date
  onAdd: (item: {
    userId: string
    title: string
    description?: string
    startTime: Date
    endTime: Date
    kind: string
    status: 'not_started'
  }) => void
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddActionItemDialog({
  selectedDate,
  slotEnd,
  onAdd,
  defaultOpen = false,
  onOpenChange,
}: AddActionItemDialogProps) {
  const [open, setOpen] = useState(defaultOpen)

  const defaultStartTime = hasNonMidnightTime(selectedDate)
    ? toTimeString(selectedDate)
    : '09:00'

  const fallbackEndTime = hasNonMidnightTime(selectedDate)
    ? toTimeString(new Date(selectedDate.getTime() + 60 * 60 * 1000))
    : '10:00'

  const canUseSlotEndAsDefault =
    !!slotEnd &&
    isSameDate(selectedDate, slotEnd) &&
    toTotalMinutes(slotEnd) > toTotalMinutes(selectedDate)

  const defaultEndTime =
    canUseSlotEndAsDefault && slotEnd ? toTimeString(slotEnd) : fallbackEndTime

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    },
  })

  // スロット選択で開かれた場合、時刻のデフォルト値をリセット
  useEffect(() => {
    if (open) {
      reset({
        title: '',
        description: '',
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    onOpenChange?.(value)
  }

  const onSubmit = (data: FormValues) => {
    const [startHour, startMinute] = data.startTime.split(':').map(Number)
    const [endHour, endMinute] = data.endTime.split(':').map(Number)

    const start = new Date(selectedDate)
    start.setHours(startHour, startMinute, 0, 0)

    const end = new Date(selectedDate)
    end.setHours(endHour, endMinute, 0, 0)

    onAdd({
      userId: 'current',
      title: data.title,
      description: data.description || undefined,
      startTime: start,
      endTime: end,
      kind: 'task',
      status: 'not_started',
    })

    handleOpenChange(false)
  }

  const content = (
    <DialogContent>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>新しいAction Item</DialogTitle>
          <DialogDescription>
            {format(selectedDate, 'yyyy年MM月dd日')} のタスクを登録しましょう
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              placeholder="例: React学習"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              placeholder="例: Hooksの復習とカスタムフック作成"
              rows={3}
              {...register('description')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="start-time">開始時刻</Label>
              <Input id="start-time" type="time" {...register('startTime')} />
              {errors.startTime && (
                <p className="text-xs text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="end-time">終了時刻</Label>
              <Input id="end-time" type="time" {...register('endTime')} />
              {errors.endTime && (
                <p className="text-xs text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button type="submit">追加</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )

  // defaultOpen=true のとき（スロットクリックから開かれた場合）はトリガーボタン不要
  if (defaultOpen) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Action Item追加
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  )
}
