'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { BuddyProfile, UpsertProfileRequest } from '../types/matching'

const GOAL_OPTIONS = [
  '副業',
  '資格取得',
  'プログラミング',
  '読書',
  '語学学習',
  'ダイエット',
  '筋トレ',
  '貯金',
  '起業',
  'デザイン',
]

const TIME_OPTIONS = ['朝（6-9時）', '午前（9-12時）', '昼（12-14時）', '夕方（17-20時）', '夜（20-24時）']

interface BuddyProfileFormProps {
  initialProfile: BuddyProfile | null
  onSave: (req: UpsertProfileRequest) => Promise<void>
}

export function BuddyProfileForm({ initialProfile, onSave }: BuddyProfileFormProps) {
  const [bio, setBio] = useState(initialProfile?.bio ?? '')
  const [goalTypes, setGoalTypes] = useState<string[]>(initialProfile?.goal_types ?? [])
  const [activeTimes, setActiveTimes] = useState<string[]>(initialProfile?.active_times ?? [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggle = (arr: string[], set: (v: string[]) => void, value: string) => {
    set(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value])
    setSaved(false)
  }

  const handleSubmit = async () => {
    if (goalTypes.length === 0 || activeTimes.length === 0) return
    setSaving(true)
    try {
      await onSave({ bio, goal_types: goalTypes, active_times: activeTimes })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>バディプロフィール設定</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>自己紹介</Label>
          <Textarea
            placeholder="目標や活動スタイルを一言で紹介してください"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value)
              setSaved(false)
            }}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>
            目標タイプ <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((g) => (
              <Badge
                key={g}
                variant={goalTypes.includes(g) ? 'default' : 'outline'}
                className="cursor-pointer select-none"
                onClick={() => toggle(goalTypes, setGoalTypes, g)}
              >
                {g}
              </Badge>
            ))}
          </div>
          {goalTypes.length === 0 && (
            <p className="text-sm text-destructive">1つ以上選択してください</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            活動時間帯 <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <Badge
                key={t}
                variant={activeTimes.includes(t) ? 'default' : 'outline'}
                className="cursor-pointer select-none"
                onClick={() => toggle(activeTimes, setActiveTimes, t)}
              >
                {t}
              </Badge>
            ))}
          </div>
          {activeTimes.length === 0 && (
            <p className="text-sm text-destructive">1つ以上選択してください</p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={saving || goalTypes.length === 0 || activeTimes.length === 0}
          className="w-full"
        >
          {saving ? '保存中...' : saved ? '保存しました' : 'プロフィールを保存'}
        </Button>
      </CardContent>
    </Card>
  )
}
